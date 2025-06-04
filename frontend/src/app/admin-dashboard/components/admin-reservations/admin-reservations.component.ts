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
  
  // Control para el filtro de hora
  timeFilter = new FormControl('');
  
  // Opciones de tiempo válidas (solo :00 y :30 minutos, :00 segundos)
  timeOptions: string[] = [];
  
  // Signal para las reservas filtradas
  filteredReservations = signal<Reservation[]>([]);
  
  reservationResource = rxResource({
    request: () => ({}),
    loader: ({ request }) => {
      return this.reservationService.getReservas();
    }
  });

  constructor() {
    // Generar opciones de tiempo válidas
    this.generateTimeOptions();
    
    // Effect para reaccionar a cambios en el resource
    effect(() => {
      const reservations = this.reservationResource.value();
      if (reservations) {
        this.applyFilters(reservations);
      }
    });

    // Suscribirse a cambios en los filtros
    this.dateFilter.valueChanges.subscribe(() => {
      const reservations = this.reservationResource.value();
      if (reservations) {
        this.applyFilters(reservations);
      }
    });

    this.timeFilter.valueChanges.subscribe(() => {
      const reservations = this.reservationResource.value();
      if (reservations) {
        this.applyFilters(reservations);
      }
    });
  }

  // Generar opciones de tiempo válidas
  private generateTimeOptions() {
    this.timeOptions = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourStr = hour.toString().padStart(2, '0');
      // Solo minutos 00 y 30
      this.timeOptions.push(`${hourStr}:00:00`);
      this.timeOptions.push(`${hourStr}:30:00`);
    }
  }

  // Método para aplicar todos los filtros
  private applyFilters(reservations: Reservation[]) {
    const selectedDate = this.dateFilter.value;
    const selectedTime = this.timeFilter.value;
    
    let filtered = reservations;
    
    // Filtro por fecha
    if (selectedDate) {
      filtered = filtered.filter(reservation => {
        const reservationDateStr = new Date(reservation.fecha).toISOString().split('T')[0];
        return reservationDateStr === selectedDate;
      });
    }
    
    // Filtro por hora
    if (selectedTime) {
      filtered = filtered.filter(reservation => {
        // Comparar las horas (formato HH:MM:SS)
        // Si la reserva tiene formato HH:MM, convertir a HH:MM:00
        const reservationTime = reservation.hora.includes(':') && reservation.hora.split(':').length === 2 
          ? `${reservation.hora}:00` 
          : reservation.hora;
        return reservationTime === selectedTime;
      });
    }
    
    this.filteredReservations.set(filtered);
  }

  // Método para limpiar el filtro de fecha
  clearDateFilter() {
    this.dateFilter.setValue('');
  }

  // Método para limpiar el filtro de hora
  clearTimeFilter() {
    this.timeFilter.setValue('');
  }

  // Método para limpiar todos los filtros
  clearAllFilters() {
    this.dateFilter.setValue('');
    this.timeFilter.setValue('');
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
    this.clearAllFilters();
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
