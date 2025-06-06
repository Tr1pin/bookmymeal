import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StripeService } from '../../../../payments/services/stripe.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { CartService } from '../../../../cart/services/cart.service';

@Component({
  selector: 'app-gracias-pedido',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gracias-pedido.component.html',
  styleUrls: ['./gracias-pedido.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraciasPedidoComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private stripeService = inject(StripeService);
  private toastService = inject(ToastService);
  private cartService = inject(CartService);
  
  isVerifying = true;
  paymentVerified = false;
  paymentDetails: any = null;

  async ngOnInit() {
    const sessionId = this.route.snapshot.queryParams['session_id'];
    const pedidoId = this.route.snapshot.queryParams['pedido_id'];

    // Si hay sessionId, verificar el pago
    if (sessionId) {
      await this.verifyPayment(sessionId);
    } else {
      // Si no hay sessionId, asumir que es un éxito directo (para otros métodos de pago)
      this.paymentVerified = true;
      this.isVerifying = false;
      this.cdr.detectChanges();
    }
  }

  private async verifyPayment(sessionId: string) {
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
        localStorage.removeItem('temp_order_data');
        
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
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy() {
    // Ya no hay timers que limpiar
  }

  // Permitir navegación manual
  goToHome() {
    this.router.navigate(['/']);
  }

  // Navegar a historial de pedidos
  goToOrderHistory() {
    this.router.navigate(['/pedidos']); // O la ruta que tengas para el historial
  }

  // Formatear cantidad para mostrar
  formatAmount(amountInCents: number): string {
    return (amountInCents / 100).toFixed(2);
  }
} 