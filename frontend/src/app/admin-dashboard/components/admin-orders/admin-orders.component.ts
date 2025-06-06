import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { OrdersService } from '../../../orders/services/orders.service';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-orders.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrdersComponent {
  private orderService = inject(OrdersService);
  private toastService = inject(ToastService);
  
  orderResource = rxResource({
    request: () => ({}),
    loader: ({ request }) =>{
      return this.orderService.getOrders();
    }
  });

  async deleteOrder(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
      try {
        await this.orderService.deleteOrder(id);
        this.orderResource.reload();
        this.toastService.showToast('Pedido eliminado correctamente', 'success');
      } catch (error) {
        this.toastService.showToast('Error al eliminar el pedido', 'error');
      }
    }
  }
}
