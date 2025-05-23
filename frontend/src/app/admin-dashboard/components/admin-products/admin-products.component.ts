import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ProductsService } from '../../../products/services/products.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'admin-products',
  templateUrl: './admin-products.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SlicePipe, RouterLink]
})
export class AdminProductsComponent {
  private productService = inject(ProductsService);
  private toastService = inject(ToastService);
  
  productsResource = rxResource({
    request: () => ({}),
    loader: ({ request }) =>{
      return this.productService.getProducts();
    }
  });

  async deleteProduct(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await this.productService.deleteProduct(id);
        // Reload the products list
        this.productsResource.reload();
        this.toastService.showToast('Producto eliminado correctamente', 'success');
      } catch (error) {
        this.toastService.showToast('Error al eliminar el producto', 'error');
      }
    }
  }
}
