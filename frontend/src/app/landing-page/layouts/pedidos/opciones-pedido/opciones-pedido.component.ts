import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DeliveryAddress {
  street: string;
  city: string;
  postalCode: string;
  phone: string;
  notes: string;
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
  templateUrl: './opciones-pedido.component.html',
  styleUrls: ['./opciones-pedido.component.css']
})
export class OpcionesPedidoComponent {
  @Output() deliveryOptionChange = new EventEmitter<'pickup' | 'delivery'>();
  @Output() paymentMethodChange = new EventEmitter<'card' | 'cash'>();
  @Output() optionsChange = new EventEmitter<{
    deliveryOption: 'pickup' | 'delivery';
    paymentMethod: 'card' | 'cash';
    deliveryAddress?: DeliveryAddress;
    cardInfo?: CardInfo;
    isValid: boolean;
  }>();

  deliveryOption: 'pickup' | 'delivery' = 'pickup';
  paymentMethod: 'card' | 'cash' = 'card';
  
  deliveryAddress: DeliveryAddress = {
    street: '',
    city: '',
    postalCode: '',
    phone: '',
    notes: ''
  };

  cardInfo: CardInfo = {
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  };

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

  private emitOptionsChange() {
    const isValid = this.isFormValid();
    
    this.optionsChange.emit({
      deliveryOption: this.deliveryOption,
      paymentMethod: this.paymentMethod,
      deliveryAddress: this.deliveryOption === 'delivery' ? this.deliveryAddress : undefined,
      cardInfo: this.paymentMethod === 'card' ? this.cardInfo : undefined,
      isValid
    });
  }

  private isFormValid(): boolean {
    let deliveryValid = true;
    let paymentValid = true;

    // Validate delivery address if delivery is selected
    if (this.deliveryOption === 'delivery') {
      deliveryValid = !!(
        this.deliveryAddress.street &&
        this.deliveryAddress.city &&
        this.deliveryAddress.postalCode &&
        this.deliveryAddress.phone &&
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

    return deliveryValid && paymentValid;
  }
}
