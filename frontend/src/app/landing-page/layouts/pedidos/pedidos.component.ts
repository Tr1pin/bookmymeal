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
  
  // Data from child components
  private contactInfo?: ContactInfo;
  private deliveryAddress?: DeliveryAddress;
  private cardInfo?: CardInfo;

  constructor(
    private cartService: CartService,
    private router: Router,
    private ordersService: OrdersService,
    private toastService: ToastService,
    private authService: AuthService
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
    cardInfo?: CardInfo;
    isValid: boolean;
    isUserAuthenticated?: boolean;
  }) {
    this.deliveryOption = event.deliveryOption;
    this.paymentMethod = event.paymentMethod;
    this.contactInfo = event.contactInfo;
    this.deliveryAddress = event.deliveryAddress;
    this.cardInfo = event.cardInfo;
    this.canPlaceOrder = event.isValid;
    this.isUserAuthenticated = event.isUserAuthenticated || false;
  }

  redirectToCarta() {
    this.router.navigate(['/carta']);
  }

  async placeOrder() {
    if (!this.canPlaceOrder) {
      return;
    }

    // No permitir pedidos en efectivo online
    if (this.paymentMethod === 'cash') {
      alert('Para pagos en efectivo, por favor contacte al 612 345 678');
      return;
    }

    try {
      let orderResult;

      if (this.isUserAuthenticated) {
        // Usar endpoint withUser para usuarios autenticados
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) {
          throw new Error('Usuario no encontrado');
        }

        const orderDataWithUser = {
          usuario_id: currentUser.id,
          tipo_entrega: (this.deliveryOption === 'pickup' ? 'recogida' : 'domicilio') as 'recogida' | 'domicilio',
          metodo_pago: (this.paymentMethod === 'card' ? 'tarjeta' : 'efectivo') as 'tarjeta' | 'efectivo',
          direccion_calle: this.deliveryOption === 'delivery' ? this.deliveryAddress?.street : undefined,
          direccion_ciudad: this.deliveryOption === 'delivery' ? this.deliveryAddress?.city : undefined,
          direccion_codigo_postal: this.deliveryOption === 'delivery' ? this.deliveryAddress?.postalCode : undefined,
          total: this.calculateTotal(),
          estado: 'pendiente',
          productos: this.cartItems.map(item => ({
            producto_id: item.product.producto_id,
            cantidad: item.quantity,
            subtotal: parseFloat(item.product.precio) * item.quantity
          }))
        };

        orderResult = await this.ordersService.createOrderWithUser(orderDataWithUser);
      } else {
        // Preparar los datos del pedido para usuarios anónimos
        const orderData = {
          // Información de contacto
          nombre_contacto: this.contactInfo?.name,
          telefono_contacto: this.contactInfo?.phone,
          email_contacto: this.contactInfo?.email,
          // Información del pedido
          tipo_entrega: (this.deliveryOption === 'pickup' ? 'recogida' : 'domicilio') as 'recogida' | 'domicilio',
          metodo_pago: (this.paymentMethod === 'card' ? 'tarjeta' : 'efectivo') as 'tarjeta' | 'efectivo',
          direccion_calle: this.deliveryOption === 'delivery' ? this.deliveryAddress?.street : undefined,
          direccion_ciudad: this.deliveryOption === 'delivery' ? this.deliveryAddress?.city : undefined,
          direccion_codigo_postal: this.deliveryOption === 'delivery' ? this.deliveryAddress?.postalCode : undefined,
          direccion_telefono: this.deliveryOption === 'delivery' ? this.contactInfo?.phone : undefined,
          usuario_id: undefined, // Pedidos anónimos
          total: this.calculateTotal(),
          estado: 'pendiente',
          productos: this.cartItems.map(item => ({
            producto_id: item.product.producto_id,
            cantidad: item.quantity,
            subtotal: parseFloat(item.product.precio) * item.quantity
          }))
        };

        orderResult = await this.ordersService.createOrder(orderData);
      }

      console.log('Order created successfully:', orderResult);
      
      // Si llegamos aquí, el pedido se creó exitosamente
      this.cartService.clearCart();
      this.toastService.showToast('¡Pedido realizado con éxito! Gracias por tu compra.', 'success');
      this.router.navigate(['/carta']);
    } catch (error: any) {
      console.error('Error creating order:', error);
      const errorMessage = error.message || 'Error al procesar el pedido. Por favor, inténtalo de nuevo.';
      this.toastService.showToast(`Error: ${errorMessage}`, 'error');
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
