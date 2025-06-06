import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService, LoginResponse } from '../../services/auth.service';
import { routes } from '../../../app.routes';

@Component({
  selector: 'app-codigo-2fa',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './codigo-2fa.component.html'
})
export class Codigo2faComponent {
  fb = inject(FormBuilder);
  route = inject(ActivatedRoute);
  authService = inject(AuthService);
  mensaje: string = '';
  loading = false;

  codigoForm: FormGroup = this.fb.group({
    email: [this.route.snapshot.params['email']],
    codigo: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
  });
  
  async onSubmit() {
  
    if (this.codigoForm.invalid) return;
    this.loading = true;
    this.mensaje = '';
    const { email, codigo } = this.codigoForm.value;
    try {
      const resp  = await this.authService.login2FA({ email, codigo });
    } catch (err: any) {
      this.mensaje = err.error?.message || 'Error en el servidor.';
    }
    this.loading = false;
  }
}
