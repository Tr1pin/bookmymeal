import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ProductsService } from '../../../products/services/products.service';
import { rxResource } from '@angular/core/rxjs-interop';

import { CartaProductDetailsComponent } from './carta-product-details/carta-product-details.component';

@Component({
  selector: 'app-carta',
  imports: [CartaProductDetailsComponent],
  templateUrl: './carta.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartaComponent { 
  private productService = inject(ProductsService);

  productsResource = rxResource({
    request: () => ({}),
    loader: ({ request }) =>{
      return this.productService.getProducts();
    }
  });

  fallbackImage = '../../../../../assets/images/static/empty.jpg';
  
  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img) img.src = this.fallbackImage;
  }

  getImageUrl(imageName: string): string {
    return `http://localhost:3001/images/products/${imageName}`;
  }
}
