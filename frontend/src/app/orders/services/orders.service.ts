import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Order } from '../interfaces/Order';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private readonly baseUrl: string = 'http://localhost:3001';
  private http = inject(HttpClient);
  
  
  
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.baseUrl+'/pedidos/pedidosProductos')
      .pipe(tap((resp) => console.log(resp)));
  }
}
