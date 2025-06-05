import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface CheckoutSessionRequest {
  order_data: any;
  success_url: string;
  cancel_url: string;
}

export interface CheckoutSessionResponse {
  message: string;
  sessionId: string;
  url: string;
  pedido: {
    numero_pedido: string;
    total: string;
  };
}

export interface PaymentVerificationResponse {
  message: string;
  session: {
    id: string;
    payment_status: string;
    status: string;
    amount_total: number;
    currency: string;
    metadata: any;
    customer_details: any;
  };
}

export interface RefundRequest {
  pedido_id: string;
  payment_intent_id: string;
  amount?: number;
}

export interface RefundResponse {
  message: string;
  refund: {
    id: string;
    amount: number;
    currency: string;
    status: string;
  };
  pedido: {
    numero_pedido: string;
    nuevo_estado: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.baseUrl}/payments/stripe`;

  async createCheckoutSession(request: CheckoutSessionRequest): Promise<CheckoutSessionResponse> {
    try {
      const response = await firstValueFrom(
        this.http.post<CheckoutSessionResponse>(`${this.baseUrl}/create-checkout-session`, request)
      );
      return response;
    } catch (error) {
      console.error('Error creando sesión de checkout:', error);
      throw error;
    }
  }


  async verifyPayment(sessionId: string): Promise<PaymentVerificationResponse> {
    try {
      const response = await firstValueFrom(
        this.http.get<PaymentVerificationResponse>(`${this.baseUrl}/verify-payment/${sessionId}`)
      );
      return response;
    } catch (error) {
      console.error('Error verificando pago:', error);
      throw error;
    }
  }


  async createRefund(request: RefundRequest): Promise<RefundResponse> {
    try {
      const response = await firstValueFrom(
        this.http.post<RefundResponse>(`${this.baseUrl}/refund`, request)
      );
      return response;
    } catch (error) {
      console.error('Error creando reembolso:', error);
      throw error;
    }
  }


  redirectToCheckout(url: string): void {
    window.location.href = url;
  }


  getPaymentUrls(pedidoId: string) {
    const baseUrl = window.location.origin;
    return {
      success_url: `${baseUrl}/pedido-exitoso?session_id={CHECKOUT_SESSION_ID}&pedido_id=${pedidoId}`,
      cancel_url: `${baseUrl}/pago-cancelado?pedido_id=${pedidoId}`
    };
  }
} 