import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RservationService } from '../../../../reservations/services/reservation.service';
import { RouterLink, Router } from '@angular/router';
@Component({
  selector: 'app-detalles-reserva',
  imports: [RouterLink],
  templateUrl: './detalles-reserva.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetallesReservaComponent {
  private reservaService = inject(RservationService);
  private router = inject(Router);

  // Propiedad simple para almacenar los datos del formulario
  detallesReserva: any = null;

  constructor() {
    this.detallesReserva = this.reservaService.getFormData();
  }

  async createReservation() {
    try {
      // Preparar los datos con el formato correcto de hora (HH:MM:SS)
      const reservationData = {
        ...this.detallesReserva,
        hora: this.detallesReserva.hora + ':00' // Agregar segundos
      };
      
      const result = await this.reservaService.createReservationWithUser(reservationData);
      this.router.navigate(['/reservas/gracias']);
    } catch (error) {
      console.error("Error al crear la reserva:", error);
    }
  }
}
