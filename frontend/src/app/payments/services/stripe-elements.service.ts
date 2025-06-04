import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

declare var Stripe: any; // Para usar Stripe.js

// Declaración para TypeScript
declare global {
  interface Window {
    Stripe: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class StripeElementsService {
  private http = inject(HttpClient);
  private stripe: any;
  private elements: any;
  private cardElement: any;

  constructor() {
    // Inicializar Stripe.js
    this.initializeStripe();
  }

  private async initializeStripe() {
    // Cargar Stripe.js si no está cargado
    if (!window.Stripe) {
      await this.loadStripeScript();
    }
    
    // Inicializar con clave pública
    this.stripe = window.Stripe('pk_test_tu_clave_publica_aqui');
    this.elements = this.stripe.elements();
  }

  private loadStripeScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.Stripe) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => resolve();
      script.onerror = () => reject('Failed to load Stripe.js');
      document.head.appendChild(script);
    });
  }

  /**
   * Crear elementos de tarjeta en el DOM
   */
  createCardElement(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container ${containerId} not found`);
    }

    this.cardElement = this.elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#424770',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
        invalid: {
          color: '#9e2146',
        },
      },
    });

    this.cardElement.mount(`#${containerId}`);
    
    // Escuchar cambios para validación en tiempo real
    this.cardElement.on('change', (event: any) => {
      const displayError = document.getElementById('card-errors');
      if (displayError) {
        if (event.error) {
          displayError.textContent = event.error.message;
        } else {
          displayError.textContent = '';
        }
      }
    });

    return this.cardElement;
  }

  /**
   * Validar tarjeta en tiempo real
   */
  async validateCard(): Promise<{valid: boolean, error?: string}> {
    if (!this.cardElement) {
      return {valid: false, error: 'Card element not initialized'};
    }

    // Crear token para validar
    const {token, error} = await this.stripe.createToken(this.cardElement);
    
    if (error) {
      return {valid: false, error: error.message};
    }

    return {valid: true};
  }

  /**
   * Procesar pago directamente (sin Checkout)
   */
  async processPayment(amount: number, currency: string = 'eur'): Promise<any> {
    try {
      // 1. Crear Payment Intent en el backend
      const response = await this.http.post(`${environment.baseUrl}/payments/stripe/create-payment-intent`, {
        amount: Math.round(amount * 100), // Convertir a céntimos
        currency
      }).toPromise();

      const {client_secret} = response as any;

      // 2. Confirmar pago con Stripe
      const result = await this.stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: this.cardElement,
        }
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.paymentIntent;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  /**
   * Limpiar elementos
   */
  destroy() {
    if (this.cardElement) {
      this.cardElement.destroy();
    }
  }
} 