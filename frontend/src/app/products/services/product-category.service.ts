import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ProductCategory } from '../interfaces/ProductCategory';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductCategoryService {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  getCategories(): Observable<ProductCategory[]> {
    return this.http.get<ProductCategory[]>(`${this.baseUrl}/product-categories`);
  }
} 