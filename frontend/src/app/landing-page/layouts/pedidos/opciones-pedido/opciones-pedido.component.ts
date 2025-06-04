import { Component, Output, EventEmitter, AfterViewInit, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../../../auth/services/auth.service';

interface DeliveryAddress {
  street: string;
  city: string;
  postalCode: string;
}

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-opciones-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './opciones-pedido.component.html'
})
export class OpcionesPedidoComponent implements AfterViewInit, OnInit {
  @Output() deliveryOptionChange = new EventEmitter<'pickup' | 'delivery'>();
  @Output() paymentMethodChange = new EventEmitter<'card' | 'cash'>();
  @Output() optionsChange = new EventEmitter<{
    deliveryOption: 'pickup' | 'delivery';
    paymentMethod: 'card' | 'cash';
    contactInfo: ContactInfo;
    deliveryAddress?: DeliveryAddress;
    isValid: boolean;
    isUserAuthenticated?: boolean;
  }>();

  private authService = inject(AuthService);

  deliveryOption: 'pickup' | 'delivery' = 'pickup';
  paymentMethod: 'card' | 'cash' = 'card';
  
  contactInfo: ContactInfo = {
    name: '',
    email: '',
    phone: ''
  };
  
  deliveryAddress: DeliveryAddress = {
    street: '',
    city: '',
    postalCode: '',
  };

  isUserAuthenticated = false;

  async ngOnInit() {
    this.isUserAuthenticated = this.authService.isAuthenticated();
    
    if (this.isUserAuthenticated) {
      await this.loadUserProfile();
    }
  }

  private async loadUserProfile() {
    try {
      const userProfile = await this.authService.getUserProfile();
      if (userProfile) {
        this.contactInfo = {
          name: userProfile.nombre || '',
          email: userProfile.email || '',
          phone: userProfile.telefono || ''
        };
      }
    } catch (error) {
      console.error('Error al cargar el perfil del usuario:', error);
    }
  }

  onDeliveryOptionChange(option: 'pickup' | 'delivery') {
    this.deliveryOption = option;
    this.deliveryOptionChange.emit(option);
    this.emitOptionsChange();
  }

  onPaymentMethodChange(method: 'card' | 'cash') {
    this.paymentMethod = method;
    this.paymentMethodChange.emit(method);
    this.emitOptionsChange();
  }

  emitOptionsChange() {
    const isValid = this.isFormValid();
    
    this.optionsChange.emit({
      deliveryOption: this.deliveryOption,
      paymentMethod: this.paymentMethod,
      contactInfo: this.contactInfo,
      deliveryAddress: this.deliveryOption === 'delivery' ? this.deliveryAddress : undefined,
      isValid: isValid,
      isUserAuthenticated: this.isUserAuthenticated
    });
  }

  private isFormValid(): boolean {
    // Validar información de contacto (solo para usuarios no autenticados)
    if (!this.isUserAuthenticated) {
      // Solo nombre y teléfono son requeridos, email es opcional
      if (!this.contactInfo.name.trim() || !this.contactInfo.phone.trim()) {
        return false;
      }

      // Validación básica de email solo si se proporciona
      if (this.contactInfo.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.contactInfo.email)) {
          return false;
        }
      }
    }

    // Validar dirección de entrega si es delivery
    if (this.deliveryOption === 'delivery') {
      if (!this.deliveryAddress.street.trim() || 
          !this.deliveryAddress.city.trim() || 
          !this.deliveryAddress.postalCode.trim()) {
        return false;
      }
    }

    return true;
  }

  ngAfterViewInit() {
    // Emitir estado inicial
    setTimeout(() => {
      this.emitOptionsChange();
    });
  }
}
