import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reservas',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './reservas.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservasComponent {
  private fb = inject(FormBuilder);

  reservaForm: FormGroup = this.fb.group({
    usuario_id: ['', [Validators.required]],
    estado: ['pendiente', [Validators.required]],
    productos: this.fb.array([]),
    total: [{ value: 0, disabled: true }],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    fecha: [null, [Validators.required]],
    horaComida: [''],
    horaCena: ['']
  });
  // Métodos para aumentar y disminuir la cantidad
  increaseCantidad() {
    const current = this.reservaForm.get('cantidad')?.value || 1;
    this.reservaForm.get('cantidad')?.setValue(current + 1);
  }

  decreaseCantidad() {
    const current = this.reservaForm.get('cantidad')?.value || 1;
    if (current > 1) {
      this.reservaForm.get('cantidad')?.setValue(current - 1);
    }
  }
}
