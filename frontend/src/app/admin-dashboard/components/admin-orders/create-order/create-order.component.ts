import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { OrdersService } from '../../../../orders/services/orders.service';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../../shared/services/toast.service';
import { ProductsService } from '../../../../products/services/products.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Product } from '../../../../products/interfaces/Product';

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

  productsResource = rxResource({
    loader: () => this.productService.getProducts()
  });

  orderForm: FormGroup = this.fb.group({
    usuario_id: ['', [Validators.required]],
    estado: ['pendiente', [Validators.required]],
    productos: this.fb.array([]),
    total: [{ value: 0, disabled: true }]
  });

  get productosFormArray() {
    return this.orderForm.get('productos') as FormArray;
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
    
    // Añadir 21% de IVA
    const total = subtotal * 1.21;
    this.orderForm.patchValue({ total: parseFloat(total.toFixed(2)) });
  }

  async onSubmit() {
    if (this.orderForm.invalid || this.productosFormArray.length === 0) {
      this.toastService.showToast('Por favor, complete todos los campos requeridos y añada al menos un producto', 'error');
      return;
    }

    try {
      const orderData = {
        usuario_id: this.orderForm.get('usuario_id')?.value,
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

      await this.orderService.createOrder(orderData);
      this.toastService.showToast('Pedido creado correctamente', 'success');
      this.router.navigate(['/admin-dashboard/pedidos']);
    } catch (error) {
      console.error('Error creating order:', error);
      this.toastService.showToast('Error al crear el pedido', 'error');
    }
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