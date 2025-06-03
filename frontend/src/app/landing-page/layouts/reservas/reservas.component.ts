import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RservationService, CheckReservationResponse } from '../../../reservations/services/reservation.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-reservas',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './reservas.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservasComponent {
  private router = inject(Router);
  private reservaService = inject(RservationService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);

  // Propiedades para mostrar disponibilidad
  isChecking = false;
  availabilityMessage = '';
  alternativeHours: string[] = [];
  showAlternatives = false;

  reservaForm: FormGroup = this.fb.group({
    usuario_id: [this.authService.getCurrentUser()?.id || '', [Validators.required]],
    estado: ['confirmada'],
    personas: [1, [Validators.required, Validators.min(1)]],
    fecha: ['', [Validators.required]],
    hora: ['', Validators.required],
  });

  async checkAvailability() {
    if (!this.reservaForm.get('fecha')?.value || !this.reservaForm.get('hora')?.value || !this.reservaForm.get('personas')?.value) {
      this.availabilityMessage = 'Por favor, complete fecha, hora y número de personas.';
      this.cdr.detectChanges();
      return;
    }

    this.isChecking = true;
    this.showAlternatives = false;
    this.cdr.detectChanges();
    
    try {
      const checkData = {
        fecha: this.reservaForm.get('fecha')?.value,
        hora: this.reservaForm.get('hora')?.value + ':00', // Agregar segundos
        personas: this.reservaForm.get('personas')?.value
      };

      const result: CheckReservationResponse = await this.reservaService.checkReservationAvailability(checkData);
      
      this.availabilityMessage = result.mensaje;
      
      if (result.disponible) {
        // Si está disponible, proceder automáticamente con la reserva
        this.showAlternatives = false;
        this.alternativeHours = [];
        
        // Guardar los datos del formulario en el servicio
        this.reservaService.setFormData(this.reservaForm.value);
        this.router.navigate(['/reservas/detalles']);
      } else if (result.horariosAlternativos && result.horariosAlternativos.length > 0) {
        // Si no está disponible pero hay horarios alternativos, mostrarlos
        this.alternativeHours = result.horariosAlternativos;
        this.showAlternatives = true;
        this.cdr.detectChanges(); // Forzar detección de cambios para mostrar alternativas
      } else {
        // Si no hay horarios alternativos disponibles, el día está completo
        this.availabilityMessage = 'Lo sentimos, este día está completo de aforo. Por favor, selecciona otra fecha.';
        this.showAlternatives = false;
        this.alternativeHours = [];
        this.cdr.detectChanges();
      }
    } catch (error) {
      this.availabilityMessage = 'Error al verificar disponibilidad';
      console.error(error);
      this.cdr.detectChanges();
    } finally {
      this.isChecking = false;
      this.cdr.detectChanges();
    }
  }

  selectAlternativeHour(hora: string) {
    this.reservaForm.get('hora')?.setValue(hora);
    this.cdr.detectChanges();
    this.checkAvailability(); // Verificar nuevamente con la nueva hora
  }

  async onSubmit() {
    if (this.reservaForm.valid) {
      // Verificar disponibilidad, que automáticamente procederá si está disponible
      await this.checkAvailability();
    }
  }
  
  // Métodos para aumentar y disminuir la cantidad
  increaseCantidad() {
    const current = this.reservaForm.get('personas')?.value || 1;
    this.reservaForm.get('personas')?.setValue(current + 1);
  }

  decreaseCantidad() {
    const current = this.reservaForm.get('personas')?.value || 1;
    if (current > 1) {
      this.reservaForm.get('personas')?.setValue(current - 1);
    }
  }
}
