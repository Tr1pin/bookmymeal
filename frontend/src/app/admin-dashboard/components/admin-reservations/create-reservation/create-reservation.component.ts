import { ChangeDetectionStrategy, Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RservationService, CheckReservationResponse } from '../../../../reservations/services/reservation.service';
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
  private cdr = inject(ChangeDetectorRef);

  // Propiedades para mostrar disponibilidad
  isChecking = false;
  availabilityMessage = '';
  alternativeHours: string[] = [];
  showAlternatives = false;
  isAvailable = false;

  // Opciones de tiempo válidas (solo :00 y :30 minutos)
  timeOptions: string[] = [];

  reservationForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
    fecha: ['', [Validators.required]],
    hora: ['', [Validators.required]],
    personas: [1, [Validators.required, Validators.min(1), Validators.max(10)]]
  });

  constructor() {
    // Generar opciones de tiempo válidas
    this.generateTimeOptions();
  }

  // Generar opciones de tiempo válidas
  private generateTimeOptions() {
    this.timeOptions = [];
    // Horarios de comida
    const comidaHours = ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00'];
    // Horarios de cena
    const cenaHours = ['20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00'];
    
    this.timeOptions = [...comidaHours, ...cenaHours];
  }

  async checkAvailability() {
    if (!this.reservationForm.get('fecha')?.value || !this.reservationForm.get('hora')?.value || !this.reservationForm.get('personas')?.value) {
      this.availabilityMessage = 'Por favor, complete fecha, hora y número de personas.';
      this.showAlternatives = false;
      this.isAvailable = false;
      this.cdr.detectChanges();
      return;
    }

    this.isChecking = true;
    this.showAlternatives = false;
    this.isAvailable = false;
    this.cdr.detectChanges();
    
    try {
      const checkData = {
        fecha: this.reservationForm.get('fecha')?.value,
        hora: this.reservationForm.get('hora')?.value + ':00', // Agregar segundos
        personas: this.reservationForm.get('personas')?.value
      };

      const result: CheckReservationResponse = await this.reservationService.checkReservationAvailability(checkData);
      
      this.availabilityMessage = result.mensaje;
      
      if (result.disponible) {
        // Si está disponible, habilitar la creación de la reserva
        this.showAlternatives = false;
        this.alternativeHours = [];
        this.isAvailable = true;
      } else if (result.horariosAlternativos && result.horariosAlternativos.length > 0) {
        // Si no está disponible pero hay horarios alternativos, mostrarlos
        this.alternativeHours = result.horariosAlternativos;
        this.showAlternatives = true;
        this.isAvailable = false;
      } else {
        // Si no hay horarios alternativos disponibles, el día está completo
        this.availabilityMessage = 'Lo sentimos, este día está completo de aforo. Por favor, selecciona otra fecha.';
        this.showAlternatives = false;
        this.alternativeHours = [];
        this.isAvailable = false;
      }
    } catch (error) {
      this.availabilityMessage = 'Error al verificar disponibilidad';
      this.isAvailable = false;
      console.error(error);
    } finally {
      this.isChecking = false;
      this.cdr.detectChanges();
    }
  }

  // Seleccionar un horario alternativo
  selectAlternativeHour(hour: string) {
    this.reservationForm.patchValue({ hora: hour });
    this.showAlternatives = false;
    this.availabilityMessage = '';
    this.isAvailable = false;
    this.cdr.detectChanges();
  }

  async onSubmit() {
    if (this.reservationForm.invalid) {
      this.toastService.showToast('Por favor, complete todos los campos requeridos', 'error');
      return;
    }

    // Si no se ha verificado la disponibilidad, verificarla primero
    if (!this.isAvailable) {
      await this.checkAvailability();
      if (!this.isAvailable) {
        this.toastService.showToast('Por favor, verifique la disponibilidad antes de crear la reserva', 'error');
        return;
      }
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