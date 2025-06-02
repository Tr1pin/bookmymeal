import { ChangeDetectionStrategy, Component, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ProductsService } from '../../../products/services/products.service';
import { CartService } from '../../../cart/services/cart.service';
import { ToastService } from '../../../shared/services/toast.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { Product } from '../../../products/interfaces/Product';
import { CartaProductDetailsComponent } from '../carta/carta-product-details/carta-product-details.component';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [ CommonModule, RouterLink],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements AfterViewInit {
  private productService = inject(ProductsService);
  private cartService = inject(CartService);
  private toastService = inject(ToastService);

  @ViewChild('carousel') carousel!: ElementRef<HTMLElement>;
  private isScrolling = false; // Flag para controlar el throttling

  // Obtener 6 productos destacados para el home
  featuredProductsResource = rxResource({
    request: () => ({}),
    loader: ({ request }) => {
      return this.productService.getFeaturedProducts(10);
    }
  });

  fallbackImage = '../../../../../assets/images/static/empty.jpg';
  
  ngAfterViewInit() {
    // Asegurar que el ViewChild esté inicializado
    console.log('ViewChild inicializado:', !!this.carousel?.nativeElement);
  }
  
  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img) img.src = this.fallbackImage;
  }

  getImageUrl(imageName: string): string {
    return `http://localhost:3001/images/products/${imageName}`;
  }

  scrollCarousel(direction: 'left' | 'right') {
    // Evitar múltiples clicks rápidos
    if (this.isScrolling) {
      console.log('Scroll en progreso, ignorando click');
      return;
    }

    this.isScrolling = true;

    // Dar un pequeño delay para asegurar que el elemento esté completamente renderizado
    setTimeout(() => {
      // Intentar primero con ViewChild
      let carousel = this.carousel?.nativeElement;
      
      // Si no funciona el ViewChild, buscar el elemento manualmente
      if (!carousel) {
        carousel = document.querySelector('section[data-carousel="true"]') as HTMLElement;
      }
      
      // Si aún no encuentra el elemento, buscar por clase
      if (!carousel) {
        carousel = document.querySelector('.carousel.rounded-box') as HTMLElement;
      }
      
      if (carousel) {
        const scrollAmount = 300;
        const currentScroll = carousel.scrollLeft;
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        
        console.log('Carousel info:', {
          scrollLeft: currentScroll,
          scrollWidth: carousel.scrollWidth,
          clientWidth: carousel.clientWidth,
          maxScroll: maxScroll,
          canScroll: maxScroll > 0
        });
        
        if (maxScroll <= 0) {
          console.warn('El carrusel no tiene contenido suficiente para hacer scroll');
          this.isScrolling = false;
          return;
        }
        
        let newScrollPosition;
        if (direction === 'left') {
          newScrollPosition = Math.max(0, currentScroll - scrollAmount);
        } else {
          newScrollPosition = Math.min(maxScroll, currentScroll + scrollAmount);
        }
        
        // Intentar con scrollTo para ser más explícito
        carousel.scrollTo({
          left: newScrollPosition,
          behavior: 'smooth'
        });
        
        console.log(`Scroll ${direction} ejecutado - de ${currentScroll} a ${newScrollPosition}`);
        
        // Liberar el flag después de que termine la animación
        setTimeout(() => {
          this.isScrolling = false;
        }, 600); // 600ms para dar tiempo a que termine la animación smooth
        
      } else {
        console.error('No se pudo encontrar el elemento carousel');
        this.isScrolling = false;
      }
    }, 100); // 100ms de delay para asegurar renderizado completo
  }

  goToPreviousSlide(currentIndex: number) {
    const totalSlides = this.featuredProductsResource.value()?.length || 0;
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
    const totalSlides = this.featuredProductsResource.value()?.length || 0;
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
