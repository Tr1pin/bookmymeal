import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Product } from '../interfaces/Product';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private baseUrl: String = 'http://localhost:3001/productos/';
  private http = inject( HttpClient );

  constructor() { }

  getProducts(): Observable<Product> {

    return this.http.get<Product>(this.baseUrl+'')
    .pipe(tap((resp) => console.log(resp)));
  } 
}
