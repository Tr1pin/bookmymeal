import { ChangeDetectionStrategy, Component, inject, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { ProductsService } from '../../../products/services/products.service';
import { CartService } from '../../../cart/services/cart.service';
import { ToastService } from '../../../shared/services/toast.service';
import { Product } from '../../../products/interfaces/Product';
import { CommonModule } from '@angular/common';
import { FeaturedProductsComponent } from "./featured-products/featured-products.component";
import { MenuProductsComponent } from "./menu-products/menu-products.component";
import { ReservationSectionComponent } from "./reservation-section/reservation-section.component";
import { MainPresentationComponent } from "./main-presentation/main-presentation.component";

@Component({
  selector: 'app-home',
  imports: [CommonModule, FeaturedProductsComponent, MenuProductsComponent, ReservationSectionComponent, MainPresentationComponent],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private cartService = inject(CartService);
  private productService = inject(ProductsService);
  private toastService = inject(ToastService);
  featuredProductsResource: Product[] | undefined;

  ngOnInit() {
    this.productService.getFeaturedProducts(10).subscribe({
    next: (productos) => {
        this.featuredProductsResource = productos;
      },
    error: (err) => {
      console.error('Error al obtener productos destacados', err);
      }
    });
  }

  goToPreviousSlide(currentIndex: number) {
    const totalSlides = this.featuredProductsResource?.length || 0;
    const previousIndex = currentIndex === 0 ? totalSlides - 1 : currentIndex - 1;
    const targetElement = document.getElementById(`slide${previousIndex + 1}`);
    
    if (targetElement) {
      targetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest', 
        inline: 'center' 
      });
    }
  }

  goToNextSlide(currentIndex: number) {
    const totalSlides = this.featuredProductsResource?.length || 0;
    const nextIndex = currentIndex === totalSlides - 1 ? 0 : currentIndex + 1;
    const targetElement = document.getElementById(`slide${nextIndex + 1}`);
    
    if (targetElement) {
      targetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest', 
        inline: 'center' 
      });
    }
  }

  addToCart(product: Product): void {
    if (product) {
      this.cartService.addItem(product, 1);
      this.toastService.showToast(`'${product.nombre}' añadido al carrito`, 'success');
    } else {
      this.toastService.showToast('Error al añadir el producto', 'error');
    }
  }
}