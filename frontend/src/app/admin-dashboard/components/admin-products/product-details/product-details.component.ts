import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../../../products/services/products.service';
import { Product } from '../../../../products/interfaces/Product';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
})
export class ProductDetailsComponent implements OnInit {
  product: Product | undefined;
  loading = true;
  error: string | null = null;
  
  private productService = inject(ProductsService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.productService.getProduct(id).subscribe({
        next: (data) => {
          this.product = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'No se pudo cargar el producto';
          this.loading = false;
        }
      });
    } else {
      this.error = 'ID de producto no especificado';
      this.loading = false;
    }
  }
}
