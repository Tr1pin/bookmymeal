import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Order } from '../interfaces/Order';
import { Observable, firstValueFrom } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

interface CreateOrderData {
  usuario_id?: string;
  nombre_contacto?: string;
  telefono_contacto?: string;
  email_contacto?: string;
  tipo_entrega: 'recogida' | 'domicilio';
  metodo_pago: 'efectivo' | 'tarjeta';
  direccion_calle?: string;
  direccion_ciudad?: string;
  direccion_codigo_postal?: string;
  direccion_telefono?: string;
  total: number;
  estado: string;
  productos: Array<{
    producto_id: string;
    cantidad: number;
    subtotal: number;
  }>;
}

interface CreateOrderWithUserData {
  usuario_id: string;
  tipo_entrega: 'recogida' | 'domicilio';
  metodo_pago: 'efectivo' | 'tarjeta';
  direccion_calle?: string;
  direccion_ciudad?: string;
  direccion_codigo_postal?: string;
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
    return this.http.get<Order[]>(this.baseUrl+'/pedidos/pedidosProductos');
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/pedidos/id/${id}`);
  }

  getOrdersByUsername(username: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/pedidos/usuario/${username}`);
  }

  async updateOrder(id: string, estado: string): Promise<Order> {
    try {
      const response = await firstValueFrom(
        this.http.put<Order>(`${this.baseUrl}/pedidos`, { id, estado })
          .pipe(
            catchError((error: HttpErrorResponse) => {
              console.error('Error en la actualización:', error);
              throw new Error(error.error?.message || 'Error al actualizar el pedido');
            })
          )
      );
      return response;
    } catch (error) {
      console.error('Error en updateOrder:', error);
      throw error;
    }
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

  async createOrderWithUser(orderData: CreateOrderWithUserData): Promise<Order> {
    const response = await firstValueFrom(
      this.http.post<Order>(`${this.baseUrl}/pedidos/with-user`, orderData)
    );
    return response;
  }
}
