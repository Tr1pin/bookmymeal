import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reservation } from '../interfaces/Reservation';

interface CreateReservationData {
  nombre: string;
  telefono: string;
  fecha: string;
  hora: string;
  personas: number;
}

interface CreateReservationWithUserData {
  usuario_id: string;
  fecha: string;
  hora: string;
  personas: number;
}

interface UpdateReservationData {
  id: string;
  estado?: string;
  fecha?: string;
  hora?: string;
  personas?: number;
}

@Injectable({
  providedIn: 'root'
})
export class RservationService {
    private readonly baseUrl: string = 'http://localhost:3001';
    private http = inject(HttpClient);
      
    getReservas(): Observable<Reservation[]> {
      return this.http.get<Reservation[]>(this.baseUrl+'/reservas/');
    }

    getReservationById(id: string): Observable<Reservation> {
      return this.http.get<Reservation>(`${this.baseUrl}/reservas/id/${id}`);
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
} 