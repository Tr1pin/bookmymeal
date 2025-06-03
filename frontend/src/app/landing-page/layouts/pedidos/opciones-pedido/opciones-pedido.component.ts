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

interface CardInfo {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
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
    cardInfo?: CardInfo;
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

  cardInfo: CardInfo = {
    number: '',
    expiry: '',
    cvv: '',
    name: ''
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
      cardInfo: this.paymentMethod === 'card' ? this.cardInfo : undefined,
      isValid,
      isUserAuthenticated: this.isUserAuthenticated
    });
  }

  private isFormValid(): boolean {
    // Para efectivo, no permitimos el pedido online
    if (this.paymentMethod === 'cash') {
      return false;
    }

    // Si el usuario está autenticado, no necesitamos validar información de contacto
    let contactValid = true;
    if (!this.isUserAuthenticated) {
      // Validar información de contacto solo si no está autenticado
      contactValid = !!(
        this.contactInfo.name &&
        this.contactInfo.phone &&
        this.contactInfo.phone.length >= 9
      );
    }

    let deliveryValid = true;
    let paymentValid = true;

    // Validate delivery address if delivery is selected
    if (this.deliveryOption === 'delivery') {
      deliveryValid = !!(
        this.deliveryAddress.street &&
        this.deliveryAddress.city &&
        this.deliveryAddress.postalCode &&
        /^[0-9]{5}$/.test(this.deliveryAddress.postalCode)
      );
    }

    // Validate card info if card is selected
    if (this.paymentMethod === 'card') {
      paymentValid = !!(
        this.cardInfo.number &&
        this.cardInfo.expiry &&
        this.cardInfo.cvv &&
        this.cardInfo.name &&
        this.cardInfo.number.length >= 13 &&
        /^[0-9]{2}\/[0-9]{2}$/.test(this.cardInfo.expiry) &&
        /^[0-9]{3,4}$/.test(this.cardInfo.cvv)
      );
    }

    return contactValid && deliveryValid && paymentValid;
  }

  ngAfterViewInit() {
    this.emitOptionsChange();
  }
}
