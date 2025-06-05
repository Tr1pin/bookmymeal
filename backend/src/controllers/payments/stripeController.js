import { StripeService } from '../../services/stripe.service.js';
import { PedidoModel } from '../../models/data/pedidoModel.js';

export class StripeController {
  /**
   * Crear una sesión de checkout de Stripe para un pedido
   */
  static async createCheckoutSession(req, res) {
    try {
      const { 
        order_data, 
        success_url, 
        cancel_url 
      } = req.body;

      if (!order_data || !success_url || !cancel_url) {
        return res.status(400).json({
          message: 'order_data, success_url y cancel_url son requeridos'
        });
      }

      // Validar que order_data tenga los campos necesarios
      if (!order_data.productos || !order_data.total || !order_data.metodo_pago) {
        return res.status(400).json({
          message: 'order_data debe incluir productos, total y metodo_pago'
        });
      }

      // Verificar que el método de pago sea tarjeta
      if (order_data.metodo_pago !== 'tarjeta') {
        return res.status(400).json({
          message: 'Este endpoint solo procesa pagos con tarjeta'
        });
      }

      // Crear la sesión de checkout
      const session = await StripeService.createCheckoutSession({
        order: order_data,
        successUrl: success_url,
        cancelUrl: cancel_url
      });

      res.status(200).json({
        message: 'Sesión de pago creada correctamente',
        sessionId: session.sessionId,
        url: session.url,
        order_preview: {
          total: order_data.total,
          productos_count: order_data.productos.length,
          tipo_entrega: order_data.tipo_entrega
        }
      });

    } catch (error) {
      console.error('Error en createCheckoutSession:', error);
      res.status(500).json({
        message: 'Error al crear sesión de pago',
        error: error.message
      });
    }
  }

  /**
   * Verificar el estado de una sesión de pago
   */
  static async verifyPayment(req, res) {
    try {
      const { session_id } = req.params;

      if (!session_id) {
        return res.status(400).json({
          message: 'session_id es requerido'
        });
      }

      const session = await StripeService.retrieveSession(session_id);

      res.status(200).json({
        message: 'Estado de pago recuperado',
        session: {
          id: session.id,
          payment_status: session.payment_status,
          status: session.status,
          amount_total: session.amount_total,
          currency: session.currency,
          metadata: session.metadata,
          customer_details: session.customer_details
        }
      });

    } catch (error) {
      console.error('Error en verifyPayment:', error);
      res.status(500).json({
        message: 'Error al verificar pago',
        error: error.message
      });
    }
  }

  /**
   * Manejar webhooks de Stripe
   */
  static async handleWebhook(req, res) {
    try {
      const signature = req.headers['stripe-signature'];
      const body = req.body;

      // Verificar el webhook
      const event = await StripeService.handleWebhook(body, signature);
      
      // Procesar el evento
      const result = await StripeService.processWebhookEvent(event);

      // Actualizar el estado del pedido según el resultado
      switch (result.type) {
        case 'payment_success':
          console.log(`Pago confirmado para ${result.numero_pedido_temp}`);
          
          try {
            // CREAR PEDIDO SOLO DESPUÉS DEL PAGO EXITOSO
            const orderResult = await PedidoModel.crearPedido({
              ...result.order_data,
              numero_pedido: result.numero_pedido_temp // Usar el número temporal generado
            });
            
            console.log(`Pedido ${result.numero_pedido_temp} creado en BD después del pago exitoso`);
            
            // REEMBOLSO AUTOMÁTICO SIEMPRE ACTIVO
            if (result.payment_intent) {
              try {
                console.log('Iniciando reembolso automático...');
                
                // Crear reembolso completo automáticamente
                const refund = await StripeService.createRefund(result.payment_intent);
                
                console.log(`Reembolso automático completado: ${refund.id}`);
                console.log(`Reembolsado: €${(refund.amount / 100).toFixed(2)}`);
                
                // Actualizar el pedido como "cancelado" por el reembolso automático
                await PedidoModel.actualizarPedido({
                  id: orderResult.pedido.pedido_id,
                  estado: 'cancelado'
                });
                
                console.log(`Pedido ${result.numero_pedido_temp} marcado como cancelado tras reembolso automático`);
                
              } catch (refundError) {
                console.error('Error en reembolso automático:', refundError);
                // No lanzamos error aquí para no fallar el webhook
              }
            }
            
          } catch (orderError) {
            console.error('Error creando pedido tras pago exitoso:', orderError);
            // El pago fue exitoso pero falló crear el pedido - esto requiere intervención manual
          }
          break;

        case 'payment_expired':
        case 'payment_failed':
          console.log(`Pago fallido/expirado para ${result.numero_pedido_temp || 'pedido temporal'}`);
          // No hay pedido que cancelar ya que nunca se creó
          break;

        default:
          console.log('Evento de webhook no procesado:', result.type);
      }

      res.status(200).json({
        message: 'Webhook procesado correctamente',
        event_type: event.type,
        result,
        auto_refund: result.type === 'payment_success' ? 'always_enabled' : 'not_applicable'
      });

    } catch (error) {
      console.error('Error en handleWebhook:', error);
      res.status(400).json({
        message: 'Error procesando webhook',
        error: error.message
      });
    }
  }

  /**
   * Crear un reembolso para un pedido
   */
  static async createRefund(req, res) {
    try {
      const { pedido_id, payment_intent_id, amount } = req.body;

      if (!pedido_id || !payment_intent_id) {
        return res.status(400).json({
          message: 'pedido_id y payment_intent_id son requeridos'
        });
      }

      // Verificar que el pedido existe
      const order = await PedidoModel.getById({ id: pedido_id });
      if (!order) {
        return res.status(404).json({
          message: 'Pedido no encontrado'
        });
      }

      // Crear el reembolso
      const refund = await StripeService.createRefund(payment_intent_id, amount);

      // Actualizar el estado del pedido
      await PedidoModel.actualizarPedido({
        id: pedido_id,
        estado: 'cancelado'
      });

      res.status(200).json({
        message: 'Reembolso creado correctamente',
        refund: {
          id: refund.id,
          amount: refund.amount,
          currency: refund.currency,
          status: refund.status
        },
        pedido: {
          numero_pedido: order.numero_pedido,
          nuevo_estado: 'cancelado'
        }
      });

    } catch (error) {
      console.error('Error en createRefund:', error);
      res.status(500).json({
        message: 'Error al crear reembolso',
        error: error.message
      });
    }
  }
} 