import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  console.log('Auth Interceptor - URL:', req.url);
  console.log('Auth Interceptor - Token exists:', !!token);

  if (token) {
    console.log('Auth Interceptor - Adding token to request');
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }

  console.log('Auth Interceptor - No token, proceeding without auth');
  return next(req);
}; 