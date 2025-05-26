import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductsService } from '../../../../products/services/products.service';
import { Product } from '../../../../products/interfaces/Product';
import { rxResource } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailsComponent {
  private productService = inject(ProductsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Get product id from the route
  productId = this.route.snapshot.params['id'];
  // Default image
  fallbackImage = '../../../../../assets/images/static/empty.jpg';

  // Load product data
  productResource = rxResource<Product, { id: string }>({
    request: () => ({ id: this.productId }),
    loader: ({ request }) => this.productService.getProduct(request.id)
  });

  // Function to check if image is not found, if its not, show the default image
  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img) img.src = this.fallbackImage;
  }
}
