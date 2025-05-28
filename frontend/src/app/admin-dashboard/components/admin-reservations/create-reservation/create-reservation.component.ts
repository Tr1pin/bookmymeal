import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RservationService } from '../../../../reservations/services/reservation.service';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../../shared/services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-reservation',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './create-reservation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateReservationComponent {
  private fb = inject(FormBuilder);
  private reservationService = inject(RservationService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  reservationForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
    fecha: ['', [Validators.required]],
    hora: ['', [Validators.required]],
    personas: [1, [Validators.required, Validators.min(1), Validators.max(10)]]
  });

  async onSubmit() {
    if (this.reservationForm.invalid) {
      this.toastService.showToast('Por favor, complete todos los campos requeridos', 'error');
      return;
    }

    try {
      const horaValue = this.reservationForm.get('hora')?.value;
      const fechaValue = this.reservationForm.get('fecha')?.value;
      
      const reservationData = {
        nombre: this.reservationForm.get('nombre')?.value,
        telefono: this.reservationForm.get('telefono')?.value,
        fecha: fechaValue,
        hora: horaValue + ':00',
        personas: this.reservationForm.get('personas')?.value
      };

      await this.reservationService.createReservation(reservationData);
      this.toastService.showToast('Reserva creada correctamente', 'success');
      this.router.navigate(['/admin-dashboard/reservas']);
    } catch (error) {
      console.error('Error creating reservation:', error);
      this.toastService.showToast('Error al crear la reserva', 'error');
    }
  }
} 