import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../interfaces/Product';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private readonly baseUrl: string = 'http://localhost:3001/productos/';
  private http = inject(HttpClient);
  
  
  
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('http://localhost:3001/productos/')
      .pipe(tap((resp) => console.log(resp)));
  }
}
