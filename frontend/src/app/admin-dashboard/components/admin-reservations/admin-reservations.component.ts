import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RservationService } from '../../../reservations/services/reservation.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { FechaUtcIsoPipe } from "../../../pipes/fecha-iso.pipe";

@Component({
  selector: 'app-admin-reservations',
  imports: [FechaUtcIsoPipe],
  templateUrl: './admin-reservations.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminReservationsComponent { 
  private reservationService = inject(RservationService);
  
  reservationResource = rxResource({
    request: () => ({}),
    loader: ({ request }) =>{
      return this.reservationService.getReservas();
    }
  });
}
