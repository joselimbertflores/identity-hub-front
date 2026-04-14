import { Router, type CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';

import { AuthDataSource } from '../auth-data-source';

export const changePasswordRouteGuard: CanActivateFn = () => {
  const authState = inject(AuthDataSource);
  const router = inject(Router);
  if (!authState.mustChangePassword()) {
    return router.createUrlTree(['/home']);
  }

  return true;
};
