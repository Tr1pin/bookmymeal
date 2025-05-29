import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ProductsService } from '../../../products/services/products.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { Product } from '../../../products/interfaces/Product';

import { CartaProductDetailsComponent } from './carta-product-details/carta-product-details.component';
import { CommonModule } from '@angular/common';

interface GroupedProducts {
  [categoryName: string]: Product[];
}

@Component({
  selector: 'app-carta',
  imports: [CartaProductDetailsComponent, CommonModule],
  templateUrl: './carta.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartaComponent { 
  private productService = inject(ProductsService);

  productsResource = rxResource({
    request: () => ({}),
    loader: ({ request }) => {
      return this.productService.getProducts();
    }
  });

  groupedProducts = computed(() => {
    const products = this.productsResource.value();
    if (!products) {
      return {} as GroupedProducts;
    }
    return products.reduce((acc, product) => {
      const category = product.categoria_nombre || 'Otros';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {} as GroupedProducts);
  });

  getCategoryNames(grouped: GroupedProducts | undefined | null): string[] {
    return grouped ? Object.keys(grouped) : [];
  }

  fallbackImage = '../../../../../assets/images/static/empty.jpg';
  
  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img) img.src = this.fallbackImage;
  }

  getImageUrl(imageName: string): string {
    return `http://localhost:3001/images/products/${imageName}`;
  }
}
