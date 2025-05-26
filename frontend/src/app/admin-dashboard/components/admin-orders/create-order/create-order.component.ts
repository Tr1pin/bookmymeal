import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
export class CreateOrderComponent {
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
    const productoForm = this.fb.group({
      producto_id: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precio: [{ value: 0, disabled: true }],
      subtotal: [{ value: 0, disabled: true }]
    });

    productoForm.get('producto_id')?.valueChanges.subscribe(id => {
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

    productoForm.get('cantidad')?.valueChanges.subscribe(cantidad => {
      if (cantidad) {
        const precio = productoForm.get('precio')?.value || 0;
        const subtotal = precio * cantidad;
        productoForm.patchValue({
          subtotal: subtotal
        });
        this.calcularTotal();
      }
    });

    this.productosFormArray.push(productoForm);
  }

  removeProducto(index: number) {
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
        productos: this.productosFormArray.controls.map(control => ({
          producto_id: control.get('producto_id')?.value,
          cantidad: control.get('cantidad')?.value,
          subtotal: control.get('subtotal')?.value
        }))
      };

      await this.orderService.createOrder(orderData);
      this.toastService.showToast('Pedido creado correctamente', 'success');
      this.router.navigate(['/admin/pedidos']);
    } catch (error) {
      this.toastService.showToast('Error al crear el pedido', 'error');
    }
  }
} 