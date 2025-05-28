import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RservationService } from '../../../../reservations/services/reservation.service';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ToastService } from '../../../../shared/services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update-reservation',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './update-reservation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateReservationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reservationService = inject(RservationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  reservationId = this.route.snapshot.params['id'];
  
  // Signal para controlar si hay cambios en el formulario
  hasChanges = signal(false);

  reservationForm: FormGroup = this.fb.group({
    estado: [''],
    fecha: [''],
    hora: [''],
    personas: ['']
  });

  ngOnInit() {
    // Suscribirse a cambios en el formulario para detectar si hay modificaciones
    this.reservationForm.valueChanges.subscribe(() => {
      this.checkForChanges();
    });
  }

  private checkForChanges() {
    const formValue = this.reservationForm.value;
    
    // Verificar si al menos un campo tiene valor
    const hasAnyValue = formValue.estado || 
                       formValue.fecha || 
                       formValue.hora || 
                       (formValue.personas && formValue.personas !== '');
    
    this.hasChanges.set(hasAnyValue);
  }

  async onSubmit() {
    if (!this.hasChanges()) {
      this.toastService.showToast('No se han realizado cambios para actualizar', 'error');
      return;
    }

    try {
      const updateData: any = {
        id: this.reservationId
      };

      // Solo incluir campos que tienen valor
      const estado = this.reservationForm.get('estado')?.value;
      const fecha = this.reservationForm.get('fecha')?.value;
      const hora = this.reservationForm.get('hora')?.value;
      const personas = this.reservationForm.get('personas')?.value;

      if (estado) updateData.estado = estado;
      if (fecha) updateData.fecha = fecha;
      if (hora) updateData.hora = hora + ':00';
      if (personas && personas !== '') updateData.personas = parseInt(personas);

      await this.reservationService.updateReservation(updateData);
      this.toastService.showToast('Reserva actualizada correctamente', 'success');
      this.router.navigate(['/admin-dashboard/reservas']);
    } catch (error: any) {
      
      let errorMessage = 'Error al actualizar la reserva';
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      this.toastService.showToast(errorMessage, 'error');
    }
  }
} 