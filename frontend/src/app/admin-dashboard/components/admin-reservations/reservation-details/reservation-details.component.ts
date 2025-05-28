import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RservationService } from '../../../../reservations/services/reservation.service';
import { Reservation } from '../../../../reservations/interfaces/Reservation';
import { rxResource } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FechaUtcIsoPipe } from '../../../../pipes/fecha-iso.pipe';

@Component({
  selector: 'app-reservation-details',
  standalone: true,
  imports: [CommonModule, RouterLink, FechaUtcIsoPipe],
  templateUrl: './reservation-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReservationDetailsComponent {
  private reservationService = inject(RservationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Get reservation id from the route
  reservationId = this.route.snapshot.params['id'];

  // Load reservation data
  reservationResource = rxResource<Reservation, { id: string }>({
    request: () => ({ id: this.reservationId }),
    loader: ({ request }) => this.reservationService.getReservationById(request.id)
  });

  // Helper method to get estado badge class
  getEstadoBadgeClass(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return 'badge-warning';
      case 'confirmada':
        return 'badge-success';
      case 'cancelada':
        return 'badge-error';
      case 'completada':
        return 'badge-info';
      default:
        return 'badge-neutral';
    }
  }

  // Helper method to format time
  formatTime(time: string): string {
    if (!time) return '';
    // Remove seconds if present (HH:MM:SS -> HH:MM)
    return time.substring(0, 5);
  }
} 