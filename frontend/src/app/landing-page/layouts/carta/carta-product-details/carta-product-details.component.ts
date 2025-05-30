import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { Product } from '../../../../products/interfaces/Product';
import { CartService } from '../../../../cart/services/cart.service';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'carta-product-details',
  templateUrl: './carta-product-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartaProductDetailsComponent {
  private cartService = inject(CartService);
  private toastService = inject(ToastService);

  fallbackImage = '../../../../../../assets/images/static/empty.jpg';

  @Input() product!: Product;
  @Input() getImageUrl!: (imageName: string) => string;
  @Input() onImageError!: (event: Event) => void;

  addToCart(): void {
    if (this.product) {
      this.cartService.addItem(this.product, 1);
      this.toastService.showToast(`'${this.product.nombre}' añadido al carrito`, 'success');
    } else {
      this.toastService.showToast('Error al añadir el producto', 'error');
    }
  }
}

