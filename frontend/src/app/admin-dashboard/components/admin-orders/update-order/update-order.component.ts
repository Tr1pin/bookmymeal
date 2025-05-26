import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { OrdersService } from '../../../../orders/services/orders.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../../shared/services/toast.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { Order } from '../../../../orders/interfaces/Order';
import { tap } from 'rxjs';

@Component({
  selector: 'app-update-order',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './update-order.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateOrderComponent {
  private fb = inject(FormBuilder);
  private orderService = inject(OrdersService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  orderId = this.route.snapshot.params['id'];

  orderResource = rxResource<Order, { id: string }>({
    request: () => ({ id: this.orderId }),
    loader: ({ request }) => this.orderService.getOrder(request.id).pipe(
      tap(order => console.log(order))
    )
  });

  orderForm: FormGroup = this.fb.group({
    estado: ['', [Validators.required]]
  });

  ngOnInit() {
    const order = this.orderResource.value();
    if (order) {
      this.orderForm.patchValue({
        estado: order.estado
      });
    }
  }

  async onSubmit() {
    if (this.orderForm.invalid) {
      this.toastService.showToast('Por favor, complete todos los campos requeridos', 'error');
      return;
    }

    try {
      await this.orderService.updateOrder(this.orderId, this.orderForm.get('estado')?.value);
      this.toastService.showToast('Pedido actualizado correctamente', 'success');
      this.router.navigate(['/admin/pedidos']);
    } catch (error) {
      this.toastService.showToast('Error al actualizar el pedido', 'error');
    }
  }
} 