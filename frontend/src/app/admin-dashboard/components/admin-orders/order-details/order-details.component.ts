import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { OrdersService } from '../../../../orders/services/orders.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './order-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailsComponent {
  private orderService = inject(OrdersService);
  private route = inject(ActivatedRoute);

  orderId = this.route.snapshot.params['id'];

  orderResource = rxResource({
    request: () => ({ id: this.orderId }),
    loader: ({ request }) => this.orderService.getOrder(request.id)
  });
} 