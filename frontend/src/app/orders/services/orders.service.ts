import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Order } from '../interfaces/Order';
import { Observable, firstValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';

interface CreateOrderData {
  usuario_id: string;
  total: number;
  estado: string;
  productos: Array<{
    producto_id: string;
    cantidad: number;
    subtotal: number;
  }>;
}

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

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/pedidos/id/${id}`).pipe(tap((resp) => console.log(resp)));
  }

  getOrdersByUsername(username: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/pedidos/usuario/${username}`)
      .pipe(tap((resp) => console.log(resp)));
  }

  async updateOrder(id: string, estado: string): Promise<Order> {
    const response = await firstValueFrom(
      this.http.put<Order>(`${this.baseUrl}/pedidos`, { id, estado })
    );
    return response;
  }

  async deleteOrder(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(`${this.baseUrl}/pedidos/${id}`)
    );
  }

  async createOrder(orderData: CreateOrderData): Promise<Order> {
    const response = await firstValueFrom(
      this.http.post<Order>(`${this.baseUrl}/pedidos`, orderData)
    );
    return response;
  }
}
