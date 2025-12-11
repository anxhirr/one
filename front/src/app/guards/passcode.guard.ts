import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { PasscodeService } from '../services/passcode.service';

export const passcodeGuard: CanActivateFn = (route, state) => {
  const passcodeService = inject(PasscodeService);
  const router = inject(Router);

  if (passcodeService.isPasscodeValid()) {
    return true;
  }

  // Redirect to passcode prompt page
  router.navigate(['/admin/passcode']);
  return false;
};
