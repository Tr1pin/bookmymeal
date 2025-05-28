import { ChangeDetectionStrategy, Component, inject, signal, effect } from '@angular/core';
import { RservationService } from '../../../reservations/services/reservation.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { FechaUtcIsoPipe } from "../../../pipes/fecha-iso.pipe";
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../shared/services/toast.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Reservation } from '../../../reservations/interfaces/Reservation';

@Component({
  selector: 'app-admin-reservations',
  imports: [FechaUtcIsoPipe, RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './admin-reservations.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminReservationsComponent { 
  private reservationService = inject(RservationService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  
  // Control para el filtro de fecha
  dateFilter = new FormControl('');
  
  // Signal para las reservas filtradas
  filteredReservations = signal<Reservation[]>([]);
  
  reservationResource = rxResource({
    request: () => ({}),
    loader: ({ request }) => {
      return this.reservationService.getReservas();
    }
  });

  constructor() {
    // Effect para reaccionar a cambios en el resource
    effect(() => {
      const reservations = this.reservationResource.value();
      if (reservations) {
        this.applyDateFilter(reservations);
      }
    });

    // Suscribirse a cambios en el filtro de fecha
    this.dateFilter.valueChanges.subscribe(() => {
      const reservations = this.reservationResource.value();
      if (reservations) {
        this.applyDateFilter(reservations);
      }
    });
  }

  // Método para aplicar el filtro de fecha
  private applyDateFilter(reservations: Reservation[]) {
    const selectedDate = this.dateFilter.value;
    
    if (!selectedDate) {
      // Si no hay fecha seleccionada, mostrar todas las reservas
      this.filteredReservations.set(reservations);
    } else {
      // Filtrar reservas por la fecha seleccionada
      const filtered = reservations.filter(reservation => {
        // Usar el pipe fechaUtcIso para comparar fechas en formato YYYY-MM-DD
        const reservationDateStr = new Date(reservation.fecha).toISOString().split('T')[0];
        return reservationDateStr === selectedDate;
      });
      this.filteredReservations.set(filtered);
    }
  }

  // Método para limpiar el filtro
  clearDateFilter() {
    this.dateFilter.setValue('');
  }

  // Filtros rápidos
  filterToday() {
    const today = new Date().toISOString().split('T')[0];
    this.dateFilter.setValue(today);
  }

  filterTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.dateFilter.setValue(tomorrow.toISOString().split('T')[0]);
  }

  filterThisWeek() {
    // Para esta semana, limpiar el filtro y mostrar todas las reservas
    // (se podría implementar un filtro más complejo si se necesita)
    this.clearDateFilter();
  }

  editReservation(reservationId: string) {
    this.router.navigate(['/admin-dashboard/reservas/actualizar', reservationId]);
  }

  async deleteReservation(reservationId: string) {
    if (confirm('¿Está seguro de que desea eliminar esta reserva?')) {
      try {
        await this.reservationService.deleteReservation(reservationId);
        this.toastService.showToast('Reserva eliminada correctamente', 'success');
        // Recargar los datos
        this.reservationResource.reload();
      } catch (error) {
        console.error('Error deleting reservation:', error);
        this.toastService.showToast('Error al eliminar la reserva', 'error');
      }
    }
  }
}
