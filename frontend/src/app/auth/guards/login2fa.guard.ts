import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Guard para proteger la ruta de 2FA: solo accesible si pending2FA está activo
export const login2faGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Usar sessionStorage para el flag temporal
  const pending2FA = sessionStorage.getItem('pending2FA') === 'true';

  if (pending2FA) {
    return true;
  } else {
    // Redirigir al login si no ha hecho el primer paso
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};
