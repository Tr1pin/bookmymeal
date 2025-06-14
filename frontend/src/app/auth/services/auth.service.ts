import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, firstValueFrom, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastService } from '../../shared/services/toast.service';

export interface LoginData {
  email: string;
  password: string;
}

export interface Login2faData {
  email: string;
  codigo: string;
}

export interface RegisterData {
  nombre: string;
  email: string;
  password: string;
  telefono: string;
}

export interface LoginResponse {
  message: string;
  token?: string;
}

export interface User {
  id: string;
  role: string;
  email?: string;
  nombre?: string;
  telefono?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = 'http://localhost:3001/auth';
  private http = inject(HttpClient);
  private router = inject(Router);
  private toastService = inject(ToastService);

  // Signal para el estado de autenticación
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Signal reactivo para el estado de login
  isLoggedIn = signal<boolean>(false);
  userRole = signal<string | null>(null);

  constructor() {
    // Verificar si hay un token guardado al inicializar el servicio
    this.checkStoredToken();
  }

  private checkStoredToken(): void {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const payload = this.decodeToken(token);
        if (payload && !this.isTokenExpired(payload)) {
          const user: User = {
            id: payload.id,
            role: payload.role
          };
          this.setCurrentUser(user);
        } else {
          this.logout();
        }
      } catch (error) {
        console.error('Error al decodificar token:', error);
        this.logout();
      }
    }
  }

  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      return null;
    }
  }

  private isTokenExpired(payload: any): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  }

  private setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
    this.isLoggedIn.set(!!user);
    this.userRole.set(user?.role || null);
  }

  async login(loginData: LoginData): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<LoginResponse>(`${this.baseUrl}/login`, loginData).pipe(
          catchError((error: HttpErrorResponse) => {
            console.error('Error en login:', error);
            throw new Error(error.error?.message || 'Error al iniciar sesión');
          })
        )
      );
      // Después de login exitoso, marcar pending2FA
      sessionStorage.setItem('pending2FA', 'true');
      return true;
    } catch (error: any) {
      this.toastService.showToast(error.message, 'error');
      return false;
    }
  }

  async login2FA(login2FA: Login2faData): Promise<void> {
    try {
      console.log(login2FA);
      const response = await firstValueFrom(
        this.http.post<LoginResponse>(`${this.baseUrl}/login2fa`, login2FA).pipe(
          catchError((error: HttpErrorResponse) => {
            console.error('Error en login2fa:', error);
            throw new Error(error.error?.message || 'Error al iniciar sesión');
          })
        )
      );

      if (response.token) {
        // Guardar el token
        localStorage.setItem('authToken', response.token);
        // Eliminar el flag pending2FA porque ya pasó 2FA
        sessionStorage.removeItem('pending2FA');
        
        // Decodificar y establecer el usuario actual
        const payload = this.decodeToken(response.token);
        const user: User = {
          id: payload.id,
          role: payload.role
        };
        
        this.setCurrentUser(user);
        this.toastService.showToast(response.message, 'success');
        
        // Redirigir según el rol
        if (user.role === 'admin') {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/']);
        }
        
      } else {
        throw new Error(response.message || 'Error al iniciar sesión');
      }
    } catch (error: any) {
      this.toastService.showToast(error.message, 'error');
      throw error;
    }
  }
  

  async register(registerData: RegisterData): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.post<{message: string}>(`${this.baseUrl}/register`, registerData).pipe(
          catchError((error: HttpErrorResponse) => {
            console.error('Error en registro:', error);
            throw new Error(error.error?.message || 'Error al registrarse');
          })
        )
      );

      this.toastService.showToast(response.message, 'success');
      this.router.navigate(['/login']);
    } catch (error: any) {
      this.toastService.showToast(error.message, 'error');
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('authToken');
    this.setCurrentUser(null);
    this.toastService.showToast('Sesión cerrada correctamente', 'success');
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  async getUserProfile(): Promise<User | null> {
    const currentUser = this.getCurrentUser();
    console.log('Current user:', currentUser);
    
    if (!currentUser || !currentUser.id) {
      console.log('No hay usuario actual o no tiene ID');
      return null;
    }

    try {
      const url = `http://localhost:3001/users/id/${currentUser.id}`;
      console.log('Haciendo petición a:', url);
      
      const response = await firstValueFrom(
        this.http.get<User>(url).pipe(
          catchError((error: HttpErrorResponse) => {
            console.error('Error HTTP al obtener perfil de usuario:', error);
            console.error('Status:', error.status);
            console.error('Message:', error.message);
            console.error('Error body:', error.error);
            return throwError(() => new Error('Error al cargar información del usuario'));
          })
        )
      );
      
      console.log('Respuesta del servidor:', response);
      return response;
    } catch (error) {
      console.error('Error en getUserProfile:', error);
      return null;
    }
  }
} 