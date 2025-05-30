import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { OrdersService } from '../../../../orders/services/orders.service';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../../shared/services/toast.service';
import { ProductsService } from '../../../../products/services/products.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Product } from '../../../../products/interfaces/Product';

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './create-order.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateOrderComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private orderService = inject(OrdersService);
  private productService = inject(ProductsService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  // Propiedades para controlar la UI
  selectedDeliveryType: 'recogida' | 'domicilio' = 'recogida';
  selectedPaymentMethod: 'efectivo' = 'efectivo'; // Solo efectivo para admin

  productsResource = rxResource({
    loader: () => this.productService.getProducts()
  });

  orderForm: FormGroup = this.fb.group({
    // Información de contacto (obligatoria)
    nombre_contacto: ['', [Validators.required]],
    telefono_contacto: ['', [Validators.required, Validators.minLength(9)]],
    email_contacto: [''],
    // Información del pedido
    usuario_id: [''], // Opcional
    tipo_entrega: ['recogida', [Validators.required]],
    metodo_pago: ['efectivo', [Validators.required]], // Solo efectivo
    direccion_calle: [''],
    direccion_ciudad: [''],
    direccion_codigo_postal: [''],
    direccion_telefono: [''],
    estado: ['pendiente', [Validators.required]],
    productos: this.fb.array([]),
    total: [{ value: 0, disabled: true }]
  });

  get productosFormArray() {
    return this.orderForm.get('productos') as FormArray;
  }

  constructor() {
    // Inicializar validaciones
    this.updateValidations();
  }

  // Métodos para cambiar tipo de entrega
  selectDeliveryType(type: 'recogida' | 'domicilio') {
    this.selectedDeliveryType = type;
    this.orderForm.patchValue({ tipo_entrega: type });
    this.updateValidations();
    // Recalcular total cuando cambie el tipo de entrega
    this.calcularTotal();
  }

  // Actualizar validaciones dinámicamente
  private updateValidations() {
    const calleControl = this.orderForm.get('direccion_calle');
    const ciudadControl = this.orderForm.get('direccion_ciudad');
    const codigoPostalControl = this.orderForm.get('direccion_codigo_postal');
    const telefonoControl = this.orderForm.get('direccion_telefono');

    // Limpiar validaciones previas
    calleControl?.clearValidators();
    ciudadControl?.clearValidators();
    codigoPostalControl?.clearValidators();
    telefonoControl?.clearValidators();

    // Si es domicilio, campos de dirección son obligatorios
    if (this.selectedDeliveryType === 'domicilio') {
      calleControl?.setValidators([Validators.required]);
      ciudadControl?.setValidators([Validators.required]);
      codigoPostalControl?.setValidators([Validators.required]);
      telefonoControl?.setValidators([Validators.required]);
    }

    // Actualizar estado de validación
    calleControl?.updateValueAndValidity();
    ciudadControl?.updateValueAndValidity();
    codigoPostalControl?.updateValueAndValidity();
    telefonoControl?.updateValueAndValidity();
  }

  addProducto() {
    const uniqueId = Date.now() + Math.random();
    
    const productoForm = this.fb.group({
      id: [uniqueId],
      producto_id: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precio: [{ value: 0, disabled: true }],
      subtotal: [{ value: 0, disabled: true }]
    });

    // Subscription para cambios en producto_id
    const productSubscription = productoForm.get('producto_id')?.valueChanges.subscribe(id => {
      const producto = this.productsResource.value()?.find(p => p.producto_id === id);
      if (producto) {
        const precio = parseFloat(producto.precio);
        const cantidad = productoForm.get('cantidad')?.value || 1;
        const subtotal = precio * cantidad;
        
        productoForm.patchValue({
          precio: precio,
          subtotal: subtotal
        });
        this.calcularTotal();
      }
    });

    // Subscription para cambios en cantidad
    const cantidadSubscription = productoForm.get('cantidad')?.valueChanges.subscribe(cantidad => {
      if (cantidad) {
        const precio = productoForm.get('precio')?.value || 0;
        const subtotal = precio * cantidad;
        
        productoForm.patchValue({
          subtotal: subtotal
        });
        this.calcularTotal();
      }
    });

    // Guardar las subscripciones para poder limpiarlas después
    (productoForm as any)._subscriptions = [productSubscription, cantidadSubscription];

    this.productosFormArray.push(productoForm);
  }

  removeProducto(index: number) {
    // Limpiar subscripciones antes de remover
    const control = this.productosFormArray.at(index);
    if (control && (control as any)._subscriptions) {
      (control as any)._subscriptions.forEach((sub: any) => {
        if (sub && typeof sub.unsubscribe === 'function') {
          sub.unsubscribe();
        }
      });
    }
    
    this.productosFormArray.removeAt(index);
    this.calcularTotal();
  }

  calcularTotal() {
    const subtotal = this.productosFormArray.controls.reduce((acc, control) => {
      return acc + (control.get('subtotal')?.value || 0);
    }, 0);
    
    // Agregar costo de entrega si es domicilio
    const deliveryCost = this.selectedDeliveryType === 'domicilio' ? 5.00 : 0;
    const subtotalWithDelivery = subtotal + deliveryCost;
    
    // Añadir 21% de IVA
    const total = subtotalWithDelivery * 1.21;
    this.orderForm.patchValue({ total: parseFloat(total.toFixed(2)) });
  }

  async onSubmit() {
    // Validaciones personalizadas
    if (this.productosFormArray.length === 0) {
      this.toastService.showToast('Debe añadir al menos un producto al pedido', 'error');
      return;
    }

    // Validar información de contacto
    const contactValid = !!(
      this.orderForm.get('nombre_contacto')?.value &&
      this.orderForm.get('telefono_contacto')?.value &&
      this.orderForm.get('telefono_contacto')?.value.length >= 9
    );

    if (!contactValid) {
      this.toastService.showToast('La información de contacto es obligatoria', 'error');
      return;
    }

    if (this.selectedDeliveryType === 'domicilio') {
      const requiredFields = ['direccion_calle', 'direccion_ciudad', 'direccion_codigo_postal', 'direccion_telefono'];
      const missingFields = requiredFields.filter(field => !this.orderForm.get(field)?.value);
      
      if (missingFields.length > 0) {
        this.toastService.showToast('Para entregas a domicilio debe completar todos los campos de dirección', 'error');
        return;
      }
    }

    if (this.orderForm.invalid) {
      this.toastService.showToast('Por favor, revise y complete todos los campos requeridos', 'error');
      this.orderForm.markAllAsTouched();
      return;
    }

    try {
      const orderData = {
        // Información de contacto
        nombre_contacto: this.orderForm.get('nombre_contacto')?.value,
        telefono_contacto: this.orderForm.get('telefono_contacto')?.value,
        email_contacto: this.orderForm.get('email_contacto')?.value || undefined,
        // Información del pedido
        usuario_id: this.orderForm.get('usuario_id')?.value || undefined,
        tipo_entrega: this.selectedDeliveryType,
        metodo_pago: this.selectedPaymentMethod,
        direccion_calle: this.selectedDeliveryType === 'domicilio' ? this.orderForm.get('direccion_calle')?.value : undefined,
        direccion_ciudad: this.selectedDeliveryType === 'domicilio' ? this.orderForm.get('direccion_ciudad')?.value : undefined,
        direccion_codigo_postal: this.selectedDeliveryType === 'domicilio' ? this.orderForm.get('direccion_codigo_postal')?.value : undefined,
        direccion_telefono: this.selectedDeliveryType === 'domicilio' ? this.orderForm.get('direccion_telefono')?.value : undefined,
        estado: this.orderForm.get('estado')?.value,
        total: parseFloat(this.orderForm.get('total')?.value),
        productos: this.productosFormArray.controls.map((control) => {
          return {
            producto_id: control.get('producto_id')?.value,
            cantidad: control.get('cantidad')?.value,
            subtotal: control.get('subtotal')?.value
          };
        })
      };
      
      // Validar que no hay productos duplicados
      const productIds = orderData.productos.map(p => p.producto_id);
      const uniqueProductIds = [...new Set(productIds)];
      
      if (productIds.length !== uniqueProductIds.length) {
        this.toastService.showToast('Error: Se detectaron productos duplicados en el pedido', 'error');
        return;
      }

      // Validar que todos los productos tienen ID válido
      const invalidProducts = orderData.productos.filter(p => !p.producto_id);
      if (invalidProducts.length > 0) {
        this.toastService.showToast('Error: Todos los productos deben tener un ID válido', 'error');
        return;
      }

      console.log('Enviando pedido:', orderData);
      await this.orderService.createOrder(orderData);
      this.toastService.showToast('¡Pedido creado correctamente!', 'success');
      this.router.navigate(['/admin-dashboard/pedidos']);
    } catch (error: any) {
      console.error('Error creating order:', error);
      const errorMessage = error.message || 'Error al crear el pedido';
      this.toastService.showToast(`Error: ${errorMessage}`, 'error');
    }
  }

  // Método para verificar si el formulario está listo para envío
  get canSubmitForm(): boolean {
    return this.selectedPaymentMethod === 'efectivo' && 
           this.orderForm.valid && 
           this.productosFormArray.length > 0;
  }

  ngOnDestroy() {
    // Limpiar todas las subscripciones cuando el componente se destruya
    this.productosFormArray.controls.forEach((control, index) => {
      const controlSubscriptions = (control as any)._subscriptions;
      if (controlSubscriptions) {
        controlSubscriptions.forEach((sub: any) => {
          if (sub && typeof sub.unsubscribe === 'function') {
            sub.unsubscribe();
          }
        });
      }
    });
  }
} 