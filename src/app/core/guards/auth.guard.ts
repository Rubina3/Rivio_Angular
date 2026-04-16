import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthState } from '../state/auth.state';

export const authGuard: CanActivateFn = (route, state) => {
  const authState = inject(AuthState);
  const router = inject(Router);

  // The guard now cleanly checks the computed Signal state
  if (authState.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};