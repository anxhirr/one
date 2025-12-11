import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If user is not authenticated, allow access to login page
  if (!authService.isUserAuthenticated()) {
    return true;
  }

  // User is authenticated, redirect to appropriate dashboard based on role
  const user = authService.getUser()();

  if (user?.role === 'store_manager') {
    router.navigate(['/sm/dashboard']);
  } else if (user?.role === 'store_representative') {
    router.navigate(['/sr/dashboard']);
  }
  // Note: Users without roles (admin) should access admin pages via passcode, not through guest guard

  return false;
};
