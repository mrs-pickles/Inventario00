import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';

/** Requiere JWT en sessionStorage o localStorage (según «Mantener la sesión»). */
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthService);

  if (auth.getToken()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

/** En /login: si ya hay sesión válida, ir al panel (p. ej. volver con «Mantener sesión»). */
export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthService);

  if (auth.getToken()) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};