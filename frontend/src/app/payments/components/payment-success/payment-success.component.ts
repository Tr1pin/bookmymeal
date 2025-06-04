import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StripeService } from '../../services/stripe.service';
import { ToastService } from '../../../shared/services/toast.service';
import { CartService } from '../../../cart/services/cart.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-100 flex items-center justify-center">
      <div class="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        @if (isVerifying) {
          <div class="text-center">
            <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
            <h2 class="text-xl font-semibold text-gray-800 mb-2">Verificando pago...</h2>
            <p class="text-gray-600">Por favor espere mientras confirmamos su pago.</p>
          </div>
        } @else if (paymentVerified) {
          <div class="text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            
            <h1 class="text-2xl font-bold text-gray-800 mb-2">¡Pago Exitoso!</h1>
            <p class="text-gray-600 mb-6">Su pedido ha sido procesado correctamente.</p>
            
            @if (paymentDetails) {
              <div class="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                <h3 class="font-semibold text-gray-700 mb-2">Detalles del pago:</h3>
                <div class="text-sm text-gray-600 space-y-1">
                  <p><span class="font-medium">Número de pedido:</span> {{ paymentDetails.metadata?.numero_pedido }}</p>
                  <p><span class="font-medium">Total pagado:</span> {{ formatAmount(paymentDetails.amount_total) }}€</p>
                  <p><span class="font-medium">Estado:</span> {{ paymentDetails.payment_status }}</p>
                </div>
              </div>
            }
            
            <div class="space-y-3">
              <button 
                routerLink="/carta" 
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
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
          </div>
        } @else {
          <div class="text-center">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            
            <h1 class="text-2xl font-bold text-gray-800 mb-2">Error en el pago</h1>
            <p class="text-gray-600 mb-6">No se pudo verificar el pago. Por favor contacte con soporte.</p>
            
            <div class="space-y-3">
              <button 
                routerLink="/pedidos" 
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Intentar de nuevo
              </button>
              
              <button 
                routerLink="/" 
                class="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Ir al inicio
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class PaymentSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private stripeService = inject(StripeService);
  private toastService = inject(ToastService);
  private cartService = inject(CartService);

  isVerifying = true;
  paymentVerified = false;
  paymentDetails: any = null;

  async ngOnInit() {
    const sessionId = this.route.snapshot.queryParams['session_id'];
    const pedidoId = this.route.snapshot.queryParams['pedido_id'];

    if (!sessionId) {
      this.isVerifying = false;
      this.toastService.showToast('No se encontró información del pago', 'error');
      return;
    }

    try {
      // Verificar el pago con Stripe
      const verification = await this.stripeService.verifyPayment(sessionId);
      
      if (verification.session.payment_status === 'paid') {
        this.paymentVerified = true;
        this.paymentDetails = verification.session;
        
        // Limpiar carrito y datos temporales
        this.cartService.clearCart();
        localStorage.removeItem('temp_cart');
        localStorage.removeItem('temp_pedido_id');
        
        this.toastService.showToast('¡Pago completado exitosamente!', 'success');
      } else {
        this.paymentVerified = false;
        this.toastService.showToast('El pago no se completó correctamente', 'error');
      }
    } catch (error) {
      console.error('Error verificando pago:', error);
      this.paymentVerified = false;
      this.toastService.showToast('Error al verificar el pago', 'error');
    } finally {
      this.isVerifying = false;
    }
  }

  formatAmount(amountInCents: number): string {
    return (amountInCents / 100).toFixed(2);
  }
} 