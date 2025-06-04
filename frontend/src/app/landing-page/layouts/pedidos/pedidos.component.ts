import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../../cart/services/cart.service';
import { OrdersService } from '../../../orders/services/orders.service';
import { ToastService } from '../../../shared/services/toast.service';
import { CartItem } from '../../../cart/interfaces/CartItem';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DetallesPedidoComponent } from './detalles-pedido/detalles-pedido.component';
import { OpcionesPedidoComponent } from './opciones-pedido/opciones-pedido.component';
import { AuthService } from '../../../auth/services/auth.service';
import { StripeService } from '../../../payments/services/stripe.service';

interface DeliveryAddress {
  street: string;
  city: string;
  postalCode: string;
}

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

interface CardInfo {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
}

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, DetallesPedidoComponent, OpcionesPedidoComponent],
  templateUrl: './pedidos.component.html'
})
export class PedidosComponent implements OnInit {
  cartItems: CartItem[] = [];
  deliveryOption: 'pickup' | 'delivery' = 'pickup';
  paymentMethod: 'card' | 'cash' = 'card';
  deliveryCost: number = 5.00;
  ivaRate: number = 0.21;
  
  // Track if options are valid
  canPlaceOrder: boolean = false;
  isUserAuthenticated: boolean = false;
  isProcessingPayment: boolean = false;
  
  // Data from child components
  private contactInfo?: ContactInfo;
  private deliveryAddress?: DeliveryAddress;

  constructor(
    private cartService: CartService,
    private router: Router,
    private ordersService: OrdersService,
    private toastService: ToastService,
    private authService: AuthService,
    private stripeService: StripeService
  ) {}

  ngOnInit() {
    this.cartItems = this.cartService.items();
  }

  onDeliveryOptionChange(option: 'pickup' | 'delivery') {
    this.deliveryOption = option;
  }

  onPaymentMethodChange(method: 'card' | 'cash') {
    this.paymentMethod = method;
  }

  onOptionsChange(event: {
    deliveryOption: 'pickup' | 'delivery';
    paymentMethod: 'card' | 'cash';
    contactInfo: ContactInfo;
    deliveryAddress?: DeliveryAddress;
    isValid: boolean;
    isUserAuthenticated?: boolean;
  }) {
    this.deliveryOption = event.deliveryOption;
    this.paymentMethod = event.paymentMethod;
    this.contactInfo = event.contactInfo;
    this.deliveryAddress = event.deliveryAddress;
    this.canPlaceOrder = event.isValid;
    this.isUserAuthenticated = event.isUserAuthenticated || false;
  }

  redirectToCarta() {
    this.router.navigate(['/carta']);
  }

  async placeOrder() {
    if (!this.canPlaceOrder || this.isProcessingPayment) {
      return;
    }

    // No permitir pedidos en efectivo online
    if (this.paymentMethod === 'cash') {
      alert('Para pagos en efectivo, por favor contacte al 612 345 678');
      return;
    }

    this.isProcessingPayment = true;
    this.toastService.showToast('Preparando pago...', 'success');

    try {
      // 🎯 PREPARAR DATOS DEL PEDIDO SIN CREAR EN BD
      let orderData;

      if (this.isUserAuthenticated) {
        // Datos del pedido para usuarios autenticados
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) {
          throw new Error('Usuario no encontrado');
        }

        orderData = {
          usuario_id: currentUser.id,
          tipo_entrega: (this.deliveryOption === 'pickup' ? 'recogida' : 'domicilio') as 'recogida' | 'domicilio',
          metodo_pago: 'tarjeta',
          direccion_calle: this.deliveryOption === 'delivery' ? this.deliveryAddress?.street : undefined,
          direccion_ciudad: this.deliveryOption === 'delivery' ? this.deliveryAddress?.city : undefined,
          direccion_codigo_postal: this.deliveryOption === 'delivery' ? this.deliveryAddress?.postalCode : undefined,
          total: this.calculateTotal(),
          productos: this.cartItems.map(item => ({
            producto_id: item.product.producto_id,
            nombre: item.product.nombre,
            descripcion: item.product.descripcion || '',
            imagen: item.product.imagens || '',
            precio: item.product.precio,
            cantidad: item.quantity,
            subtotal: parseFloat(item.product.precio) * item.quantity
          }))
        };
      } else {
        // Datos del pedido para usuarios anónimos
        orderData = {
          nombre_contacto: this.contactInfo?.name,
          telefono_contacto: this.contactInfo?.phone,
          email_contacto: this.contactInfo?.email,
          tipo_entrega: (this.deliveryOption === 'pickup' ? 'recogida' : 'domicilio') as 'recogida' | 'domicilio',
          metodo_pago: 'tarjeta',
          direccion_calle: this.deliveryOption === 'delivery' ? this.deliveryAddress?.street : undefined,
          direccion_ciudad: this.deliveryOption === 'delivery' ? this.deliveryAddress?.city : undefined,
          direccion_codigo_postal: this.deliveryOption === 'delivery' ? this.deliveryAddress?.postalCode : undefined,
          direccion_telefono: this.deliveryOption === 'delivery' ? this.contactInfo?.phone : undefined,
          total: this.calculateTotal(),
          productos: this.cartItems.map(item => ({
            producto_id: item.product.producto_id,
            nombre: item.product.nombre,
            descripcion: item.product.descripcion || '',
            imagen: item.product.imagens || '',
            precio: item.product.precio,
            cantidad: item.quantity,
            subtotal: parseFloat(item.product.precio) * item.quantity
          }))
        };
      }

      console.log('Datos del pedido preparados:', orderData);
      
      // 🚀 PROCEDER DIRECTAMENTE CON STRIPE (sin crear pedido en BD)
      await this.processStripePayment(orderData);

    } catch (error: any) {
      console.error('Error preparando pago:', error);
      const errorMessage = error.message || 'Error al preparar el pago. Por favor, inténtalo de nuevo.';
      this.toastService.showToast(`Error: ${errorMessage}`, 'error');
    } finally {
      this.isProcessingPayment = false;
    }
  }

  private async processStripePayment(orderData: any) {
    try {
      this.toastService.showToast('Redirigiendo al pago...', 'success');

      // Generar ID temporal para las URLs
      const tempId = `temp_${Date.now()}`;
      
      // Obtener URLs de éxito y cancelación
      const paymentUrls = this.stripeService.getPaymentUrls(tempId);

      // Crear sesión de checkout en Stripe con datos del pedido
      const checkoutSession = await this.stripeService.createCheckoutSession({
        order_data: orderData,
        success_url: paymentUrls.success_url,
        cancel_url: paymentUrls.cancel_url
      });

      // Guardar el carrito temporalmente en localStorage por si el usuario vuelve
      localStorage.setItem('temp_cart', JSON.stringify(this.cartItems));
      localStorage.setItem('temp_order_data', JSON.stringify(orderData));

      // Redirigir a Stripe
      this.stripeService.redirectToCheckout(checkoutSession.url);

    } catch (error: any) {
      console.error('Error processing Stripe payment:', error);
      this.toastService.showToast('Error al procesar el pago. Inténtalo de nuevo.', 'error');
    }
  }

  private calculateTotal(): number {
    const subtotal = this.cartItems.reduce((sum, item) => {
      return sum + (parseFloat(item.product.precio) * item.quantity);
    }, 0);
    
    const deliveryFee = this.deliveryOption === 'delivery' ? this.deliveryCost : 0;
    const subtotalWithDelivery = subtotal + deliveryFee;
    const ivaAmount = subtotalWithDelivery * this.ivaRate;
    
    return subtotalWithDelivery + ivaAmount;
  }
}
