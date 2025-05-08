import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ProductsService } from '../../../products/services/products.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'admin-products',
  templateUrl: './admin-products.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SlicePipe]
})
export class AdminProductsComponent {
  private productService = inject(ProductsService);
  
  productsResource = rxResource({
    request: () => ({}),
    loader: ({ request }) =>{
      return this.productService.getProducts();
    }
  });

  

}
