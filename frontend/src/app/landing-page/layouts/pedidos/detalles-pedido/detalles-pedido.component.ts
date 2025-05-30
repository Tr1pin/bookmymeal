import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItem } from '../../../../cart/interfaces/CartItem';

@Component({
  selector: 'app-detalles-pedido',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalles-pedido.component.html'
})
export class DetallesPedidoComponent {
  @Input() cartItems: CartItem[] = [];
  @Input() deliveryOption: 'pickup' | 'delivery' = 'pickup';
  @Input() paymentMethod: 'card' | 'cash' = 'card';
  @Input() deliveryCost: number = 5.00;
  @Input() ivaRate: number = 0.21;
  @Input() canPlaceOrder: boolean = false;
  
  @Output() placeOrder = new EventEmitter<void>();

  fallbackImage = '../../../../../assets/images/static/empty.jpg';

  get subtotal(): number {
    return this.cartItems.reduce((sum, item) => {
      return sum + (parseFloat(item.product.precio) * item.quantity);
    }, 0);
  }

  get subtotalWithDelivery(): number {
    const deliveryFee = this.deliveryOption === 'delivery' ? this.deliveryCost : 0;
    return this.subtotal + deliveryFee;
  }

  get ivaAmount(): number {
    return this.subtotalWithDelivery * this.ivaRate;
  }

  get total(): number {
    return this.subtotalWithDelivery + this.ivaAmount;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img) img.src = this.fallbackImage;
  }

  getImageUrl(imageName: string): string {
    return `http://localhost:3001/images/products/${imageName}`;
  }

  onPlaceOrder() {
    if (this.canPlaceOrder) {
      this.placeOrder.emit();
    }
  }
} 