import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    // Si no está autenticado, redirigir al login
    router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  if (authService.isAdmin()) {
    return true;
  } else {
    // Si está autenticado pero no es admin, redirigir al home
    router.navigate(['/']);
    return false;
  }
}; 