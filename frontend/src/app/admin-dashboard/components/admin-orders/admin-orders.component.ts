import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { OrdersService } from '../../../orders/services/orders.service';

@Component({
  selector: 'app-admin-orders',
  imports: [],
  templateUrl: './admin-orders.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrdersComponent {
  private orderService = inject(OrdersService);
  
  orderResource = rxResource({
    request: () => ({}),
    loader: ({ request }) =>{
      return this.orderService.getOrders();
    }
  });
}
