import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthState } from '../state/auth.state';

export const guestGuard: CanActivateFn = (route, state) => {
  const authState = inject(AuthState);
  const router = inject(Router);

  // If the user is already logged in, bounce them directly to the dashboard
  if (authState.isAuthenticated()) {
    router.navigate(['/dashboard']);
    return false;
  }

  // Otherwise, let them see the login page
  return true;
};