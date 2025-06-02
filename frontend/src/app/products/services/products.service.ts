import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Product } from '../interfaces/Product';
import { Observable, firstValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/productos/productsImages`)
      .pipe(tap((resp) => console.log(resp)));
  }

  getFeaturedProducts(limit: number = 10): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/productos/${limit}`)
      .pipe(tap((resp) => console.log(`Featured products (${limit}):`, resp)));
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/productos/id/${id}`);
  }

  async createProduct(formData: FormData): Promise<Product> {
    const response = await firstValueFrom(
      this.http.post<Product>(`${this.baseUrl}/productos`, formData)
    );
    return response;
  }

  async updateProduct(formData: FormData): Promise<Product> {
    const response = await firstValueFrom(
      this.http.put<Product>(`${this.baseUrl}/productos`, formData)
    );
    return response;
  }

  async deleteProduct(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(`${this.baseUrl}/productos/${id}`)
    );
  }

  async deleteProductImage(productId: string, filename: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(`${this.baseUrl}/productos/${productId}/images/${filename}`)
    );
  }
}
