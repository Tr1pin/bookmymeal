import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, ElementRef, inject, Input, ViewChild } from "@angular/core";
import { CartService } from "../../../../cart/services/cart.service";
import { Product } from "../../../../products/interfaces/Product";
import { ToastService } from "../../../../shared/services/toast.service";


@Component({
  selector: 'app-home-featured-component',
  imports: [ CommonModule],
  templateUrl: './featured-products.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturedProductsComponent {
    private cartService = inject(CartService);
    private toastService = inject(ToastService);

    @Input() featuredProducts: Product[] | undefined;

    fallbackImage = '../../../../../assets/images/static/empty.jpg';
    
    onImageError(event: Event) {
        const img = event.target as HTMLImageElement;
        if (img) img.src = this.fallbackImage;
    }

    getImageUrl(imageName: string): string {
        return `http://localhost:3001/images/products/${imageName}`;
    }

    addToCart(product: Product): void {
      if (product) {
        this.cartService.addItem(product, 1);
        this.toastService.showToast(`${product.nombre} añadido al carrito`, 'success');
      } else {
        this.toastService.showToast('Error al añadir el producto', 'error');
      }
    }

     @ViewChild('carousel') carousel!: ElementRef<HTMLElement>;
     private isScrolling = false; // Flag para controlar el throttling

  
    ngAfterViewInit() {
        // Asegurar que el ViewChild esté inicializado
        console.log('ViewChild inicializado:', !!this.carousel?.nativeElement);
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
        const totalSlides = this.featuredProducts?.length || 0;
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
        const totalSlides = this.featuredProducts?.length || 0;
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

  
}