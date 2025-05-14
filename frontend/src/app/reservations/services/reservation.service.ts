import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reservation } from '../interfaces/Reservation';

@Injectable({
  providedIn: 'root'
})
export class RservationService {
    private readonly baseUrl: string = 'http://localhost:3001';
    private http = inject(HttpClient);
      
      
      
      getReservas(): Observable<Reservation[]> {
        return this.http.get<Reservation[]>(this.baseUrl+'/reservas/')
          .pipe(tap((resp) => console.log(resp)));
    }
} 