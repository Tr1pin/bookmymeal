import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService, RegisterData } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  isLoading = false;

  registerForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      if (confirmPassword?.errors?.['passwordMismatch']) {
        confirmPassword.setErrors(null);
      }
    }
    return null;
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      
      try {
        const { confirmPassword, ...registerData }: RegisterData & { confirmPassword: string } = this.registerForm.value;
        await this.authService.register(registerData);
      } catch (error) {
        console.error('Error en registro:', error);
      } finally {
        this.isLoading = false;
      }
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        const fieldLabels: { [key: string]: string } = {
          nombre: 'Nombre',
          email: 'Email',
          telefono: 'Teléfono',
          password: 'Contraseña',
          confirmPassword: 'Confirmación de contraseña'
        };
        return `${fieldLabels[fieldName]} es requerido`;
      }
      if (field.errors['email']) {
        return 'Email no válido';
      }
      if (field.errors['pattern'] && fieldName === 'telefono') {
        return 'El teléfono debe tener exactamente 9 dígitos';
      }
      if (field.errors['minlength']) {
        if (fieldName === 'nombre') {
          return 'El nombre debe tener al menos 3 caracteres';
        }
        if (fieldName === 'password') {
          return 'La contraseña debe tener al menos 6 caracteres';
        }
      }
      if (field.errors['passwordMismatch']) {
        return 'Las contraseñas no coinciden';
      }
    }
    return '';
  }
} 