import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../../auth/services/auth.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, catchError, throwError } from 'rxjs';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private toastService = inject(ToastService);

  // Signals para el estado del componente
  userProfile = signal<User | null>(null);
  isLoading = signal<boolean>(false);
  isEditing = signal<boolean>(false);

  // Datos del formulario
  formData = {
    nombre: '',
    email: '',
    telefono: '',
    password: ''
  };

  // Datos originales para comparar cambios
  originalData = {
    nombre: '',
    email: '',
    telefono: ''
  };

  async ngOnInit() {
    await this.loadUserProfile();
  }

  async loadUserProfile() {
    this.isLoading.set(true);
    try {
      console.log('Cargando perfil del usuario...');
      const profile = await this.authService.getUserProfile();
      console.log('Perfil obtenido:', profile);
      if (profile) {
        this.userProfile.set(profile);
        this.formData = {
          nombre: profile.nombre || '',
          email: profile.email || '',
          telefono: profile.telefono || '',
          password: ''
        };
        this.originalData = {
          nombre: profile.nombre || '',
          email: profile.email || '',
          telefono: profile.telefono || ''
        };
      } else {
        console.log('No se pudo obtener el perfil del usuario');
        this.toastService.showToast('No se pudo cargar el perfil del usuario', 'error');
      }
    } catch (error) {
      console.error('Error en loadUserProfile:', error);
      this.toastService.showToast('Error al cargar el perfil', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  toggleEdit() {
    if (this.isEditing()) {
      // Cancelar edición, restaurar datos originales
      this.formData = {
        nombre: this.originalData.nombre,
        email: this.originalData.email,
        telefono: this.originalData.telefono,
        password: ''
      };
    }
    this.isEditing.set(!this.isEditing());
  }

  async saveProfile() {
    if (!this.userProfile()) return;

    this.isLoading.set(true);
    try {
      const updateData: any = {
        id: this.userProfile()!.id,
        nombre: this.formData.nombre,
        email: this.formData.email,
        telefono: this.formData.telefono
      };

      // Solo incluir password si se proporcionó uno nuevo
      if (this.formData.password.trim()) {
        updateData.password = this.formData.password;
      }

      const response = await firstValueFrom(
        this.http.put<{message: string}>('http://localhost:3001/users', updateData).pipe(
          catchError((error: HttpErrorResponse) => {
            console.error('Error al actualizar perfil:', error);
            throw new Error(error.error?.message || 'Error al actualizar el perfil');
          })
        )
      );

      this.toastService.showToast(response.message || 'Perfil actualizado correctamente', 'success');
      
      // Actualizar datos originales
      this.originalData = {
        nombre: this.formData.nombre,
        email: this.formData.email,
        telefono: this.formData.telefono
      };
      
      // Limpiar password
      this.formData.password = '';
      
      // Salir del modo edición
      this.isEditing.set(false);
      
      // Recargar perfil para mostrar datos actualizados
      await this.loadUserProfile();

    } catch (error: any) {
      this.toastService.showToast(error.message, 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  hasChanges(): boolean {
    return (
      this.formData.nombre !== this.originalData.nombre ||
      this.formData.email !== this.originalData.email ||
      this.formData.telefono !== this.originalData.telefono ||
      this.formData.password.trim() !== ''
    );
  }
} 