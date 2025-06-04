import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../cart/services/cart.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-100 flex items-center justify-center">
      <div class="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div class="text-center">
          <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5l-6.928-12c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          
          <h1 class="text-2xl font-bold text-gray-800 mb-2">Pago Cancelado</h1>
          <p class="text-gray-600 mb-6">Has cancelado el proceso de pago. Tu pedido no ha sido procesado.</p>
          
          @if (cartRestored) {
            <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <p class="text-sm text-green-700">Tu carrito ha sido restaurado</p>
              </div>
            </div>
          }
          
          <div class="space-y-3">
            <button 
              routerLink="/pedidos" 
              class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Intentar pago nuevamente
            </button>
            
            <button 
              routerLink="/carta" 
              class="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Continuar comprando
            </button>
            
            <button 
              routerLink="/" 
              class="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Ir al inicio
            </button>
          </div>
          
          <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 class="font-semibold text-gray-700 mb-2">¿Necesitas ayuda?</h3>
            <p class="text-sm text-gray-600 mb-2">Si tienes problemas con el pago, puedes:</p>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Llamarnos al 612 345 678</li>
              <li>• Pagar en efectivo en nuestro local</li>
              <li>• Intentar con otra tarjeta</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PaymentCancelComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cartService = inject(CartService);
  private toastService = inject(ToastService);

  cartRestored = false;

  ngOnInit() {
    // Intentar restaurar el carrito desde localStorage
    this.restoreCart();
  }

  private restoreCart() {
    try {
      const tempCart = localStorage.getItem('temp_cart');
      if (tempCart) {
        const cartItems = JSON.parse(tempCart);
        
        // Restaurar cada item al carrito
        cartItems.forEach((item: any) => {
          this.cartService.addItem(item.product, item.quantity);
        });
        
        this.cartRestored = true;
        this.toastService.showToast('Tu carrito ha sido restaurado', 'success');
        
        // Limpiar datos temporales
        localStorage.removeItem('temp_cart');
        localStorage.removeItem('temp_pedido_id');
      }
    } catch (error) {
      console.error('Error restaurando carrito:', error);
      this.toastService.showToast('No se pudo restaurar el carrito', 'error');
    }
  }
} 