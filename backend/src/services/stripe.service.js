import Stripe from 'stripe';

// Configurar Stripe con tu clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...', {
  apiVersion: '2025-05-28.basil',
});

export class StripeService {
  /**
   * Crear una sesión de checkout para el pago de un pedido
   */
  static async createCheckoutSession({ order, successUrl, cancelUrl }) {
    try {
      // Generar número de pedido temporal
      const numero_pedido_temp = `PED-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`;

      // Convertir los productos del pedido a line_items de Stripe
      const lineItems = order.productos.map(producto => {
        const productData = {
          name: producto.nombre || `Producto ${producto.producto_id}`,
        };

        // Solo agregar description si no está vacía
        if (producto.descripcion && producto.descripcion.trim() !== '') {
          productData.description = producto.descripcion;
        }

        // Solo agregar images si existe la imagen
        if (producto.imagen) {
          productData.images = [`${process.env.BASE_URL}/images/products/${producto.imagen}`];
        }

        return {
          price_data: {
            currency: 'eur',
            product_data: productData,
            unit_amount: Math.round(parseFloat(producto.precio || producto.subtotal / producto.cantidad) * 100), // Stripe usa céntimos
          },
          quantity: producto.cantidad,
        };
      });

      // Agregar gastos de envío si es delivery
      if (order.tipo_entrega === 'domicilio') {
        lineItems.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Gastos de envío',
              description: 'Entrega a domicilio',
            },
            unit_amount: 500, // 5.00€ en céntimos
          },
          quantity: 1,
        });
      }

      // Crear datos compactos para metadata (Stripe limita a 500 caracteres)
      const compactOrderData = {
        user_id: order.usuario_id,
        contact_name: order.nombre_contacto,
        contact_phone: order.telefono_contacto,
        contact_email: order.email_contacto,
        delivery_type: order.tipo_entrega,
        payment_method: order.metodo_pago,
        total: order.total,
        status: 'en preparación'
      };

      // Agregar dirección solo si es delivery y está presente
      if (order.tipo_entrega === 'domicilio') {
        if (order.direccion_calle) compactOrderData.address_street = order.direccion_calle;
        if (order.direccion_ciudad) compactOrderData.address_city = order.direccion_ciudad;
        if (order.direccion_codigo_postal) compactOrderData.address_postal = order.direccion_codigo_postal;
        if (order.direccion_telefono) compactOrderData.address_phone = order.direccion_telefono;
      }

      // Productos simplificados para metadata
      const compactProducts = order.productos.map(p => ({
        id: p.producto_id,
        name: p.nombre,
        price: p.precio,
        qty: p.cantidad
      }));

      const sessionConfig = {
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          numero_pedido_temp: numero_pedido_temp,
          order_data: JSON.stringify(compactOrderData),
          products: JSON.stringify(compactProducts)
        },
        billing_address_collection: 'required',
        phone_number_collection: {
          enabled: true,
        },
      };

      // Validar tamaño de metadata
      const orderDataSize = JSON.stringify(compactOrderData).length;
      const productsSize = JSON.stringify(compactProducts).length;
      console.log(`📊 Tamaño metadata - order_data: ${orderDataSize}, products: ${productsSize}, total aprox: ${orderDataSize + productsSize + 50}`);
      
      if (orderDataSize > 500) {
        console.warn(`⚠️ order_data excede 500 caracteres: ${orderDataSize}`);
      }
      if (productsSize > 500) {
        console.warn(`⚠️ products excede 500 caracteres: ${productsSize}`);
      }

      // Solo agregar customer_email si es válido y no está vacío
      if (order.email_contacto && order.email_contacto.trim() !== '') {
        sessionConfig.customer_email = order.email_contacto;
      }

      // Solo agregar shipping_address_collection si es delivery
      if (order.tipo_entrega === 'domicilio') {
        sessionConfig.shipping_address_collection = {
          allowed_countries: ['ES'],
        };
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      console.error('Error creando sesión de Stripe:', error);
      throw new Error(`Error al crear sesión de pago: ${error.message}`);
    }
  }

  /**
   * Verificar el estado de una sesión de pago
   */
  static async retrieveSession(sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return session;
    } catch (error) {
      console.error('Error recuperando sesión de Stripe:', error);
      throw new Error(`Error al recuperar sesión: ${error.message}`);
    }
  }

  /**
   * Manejar webhooks de Stripe
   */
  static async handleWebhook(body, signature) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      throw new Error(`Webhook Error: ${err.message}`);
    }

    return event;
  }

  /**
   * Procesar eventos de webhook específicos
   */
  static async processWebhookEvent(event) {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Pago completado:', session.id);
        
        // Reconstruir datos del pedido desde metadata compactos
        const compactOrderData = JSON.parse(session.metadata.order_data);
        const compactProducts = JSON.parse(session.metadata.products);
        
        // Reconstruir el formato completo del pedido
        const orderData = {
          usuario_id: compactOrderData.user_id || null,
          nombre_contacto: compactOrderData.contact_name || null,
          telefono_contacto: compactOrderData.contact_phone || null,
          email_contacto: compactOrderData.contact_email || null,
          tipo_entrega: compactOrderData.delivery_type,
          metodo_pago: compactOrderData.payment_method,
          direccion_calle: compactOrderData.address_street || null,
          direccion_ciudad: compactOrderData.address_city || null,
          direccion_codigo_postal: compactOrderData.address_postal || null,
          direccion_telefono: compactOrderData.address_phone || null,
          total: compactOrderData.total,
          estado: compactOrderData.status,
          productos: compactProducts.map(p => ({
            producto_id: p.id,
            nombre: p.name,
            precio: p.price,
            cantidad: p.qty,
            subtotal: parseFloat(p.price) * p.qty
          }))
        };
        
        return {
          type: 'payment_success',
          numero_pedido_temp: session.metadata.numero_pedido_temp,
          payment_intent: session.payment_intent,
          amount_total: session.amount_total,
          order_data: orderData
        };

      case 'checkout.session.expired':
        const expiredSession = event.data.object;
        console.log('Sesión de pago expirada:', expiredSession.id);
        
        return {
          type: 'payment_expired',
          numero_pedido_temp: expiredSession.metadata.numero_pedido_temp
        };

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Pago fallido:', failedPayment.id);
        
        return {
          type: 'payment_failed',
          payment_intent: failedPayment.id,
          last_payment_error: failedPayment.last_payment_error,
        };

      default:
        console.log(`Evento no manejado: ${event.type}`);
        return {
          type: 'unhandled',
          event_type: event.type,
        };
    }
  }

  /**
   * Crear un reembolso
   */
  static async createRefund(paymentIntentId, amount = null) {
    try {
      const refundConfig = {
        payment_intent: paymentIntentId,
      };

      // Solo agregar amount si se especifica un monto parcial
      // Si amount es null, Stripe hace reembolso completo automáticamente
      if (amount !== null && amount !== undefined) {
        refundConfig.amount = amount;
      }

      console.log('🔄 Creando reembolso con configuración:', refundConfig);

      const refund = await stripe.refunds.create(refundConfig);

      return refund;
    } catch (error) {
      console.error('Error creando reembolso:', error);
      throw new Error(`Error al crear reembolso: ${error.message}`);
    }
  }
} 