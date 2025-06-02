import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reservation } from '../interfaces/Reservation';

export interface CreateReservationData {
  nombre: string;
  telefono: string;
  fecha: string;
  hora: string;
  personas: number;
}

export interface CreateReservationWithUserData {
  usuario_id: string;
  fecha: string;
  hora: string;
  personas: number;
}

export interface UpdateReservationData {
  id: string;
  estado?: string;
  fecha?: string;
  hora?: string;
  personas?: number;
}

export interface CheckReservationData {
  fecha: string;
  hora: string;
  personas: number;
}

export interface CheckReservationResponse {
  disponible: boolean;
  mensaje: string;
  mesa_id?: string;
  horariosAlternativos?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class RservationService {
    private readonly baseUrl: string = 'http://localhost:3001';
    private http = inject(HttpClient);
    
    // Propiedad simple para almacenar datos del formulario
    private formData: any = null;
      
    getReservas(): Observable<Reservation[]> {
      return this.http.get<Reservation[]>(this.baseUrl+'/reservas/');
    }

    getReservationById(id: string): Observable<Reservation> {
      return this.http.get<Reservation>(`${this.baseUrl}/reservas/id/${id}`);
    }

    // Métodos simples para manejar los datos del formulario
    setFormData(data: any) {
      this.formData = data;
    }

    getFormData() {
      return this.formData;
    }

    clearFormData() {
      this.formData = null;
    }

    async createReservation(reservationData: CreateReservationData): Promise<any> {
      const response = await firstValueFrom(
        this.http.post<any>(`${this.baseUrl}/reservas`, reservationData)
      );
      return response;
    }

    async createReservationWithUser(reservationData: CreateReservationWithUserData): Promise<any> {
      const response = await firstValueFrom(
        this.http.post<any>(`${this.baseUrl}/reservas/with-user`, reservationData)
      );
      return response;
    }

    async updateReservation(reservationData: UpdateReservationData): Promise<any> {
      const response = await firstValueFrom(
        this.http.put<any>(`${this.baseUrl}/reservas`, reservationData)
      );
      return response;
    }

    async deleteReservation(id: string): Promise<any> {
      const response = await firstValueFrom(
        this.http.delete<any>(`${this.baseUrl}/reservas/${id}`)
      );
      return response;
    }

    async checkReservationAvailability(checkData: CheckReservationData): Promise<CheckReservationResponse> {
      const response = await firstValueFrom(
        this.http.post<CheckReservationResponse>(`${this.baseUrl}/reservas/checkReservation`, checkData)
      );
      return response;
    }
} 