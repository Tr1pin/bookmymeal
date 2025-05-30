import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../../cart/services/cart.service';
import { CartItem } from '../../../cart/interfaces/CartItem';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DetallesPedidoComponent } from './detalles-pedido/detalles-pedido.component';
import { OpcionesPedidoComponent } from './opciones-pedido/opciones-pedido.component';

interface DeliveryAddress {
  street: string;
  city: string;
  postalCode: string;
  phone: string;
  notes: string;
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
  
  // Data from child components
  private deliveryAddress?: DeliveryAddress;
  private cardInfo?: CardInfo;

  constructor(
    private cartService: CartService,
    private router: Router
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
    deliveryAddress?: DeliveryAddress;
    cardInfo?: CardInfo;
    isValid: boolean;
  }) {
    this.deliveryOption = event.deliveryOption;
    this.paymentMethod = event.paymentMethod;
    this.deliveryAddress = event.deliveryAddress;
    this.cardInfo = event.cardInfo;
    this.canPlaceOrder = event.isValid;
  }

  redirectToCarta() {
    this.router.navigate(['/carta']);
  }

  placeOrder() {
    if (!this.canPlaceOrder) {
      return;
    }

    // Simulate order placement
    console.log('Order placed:', {
      items: this.cartItems,
      deliveryOption: this.deliveryOption,
      paymentMethod: this.paymentMethod,
      deliveryAddress: this.deliveryAddress,
      cardInfo: this.cardInfo
    });

    // Clear cart and redirect
    this.cartService.clearCart();
    alert('¡Pedido realizado con éxito! Gracias por tu compra.');
    this.router.navigate(['/carta']);
  }
}
