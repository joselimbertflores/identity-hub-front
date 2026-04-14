import { Router, type CanActivateChildFn } from '@angular/router';
import { inject } from '@angular/core';

import { AuthDataSource } from '../auth-data-source';

export const mustChangePasswordGuard: CanActivateChildFn = () => {
  const authDataSource = inject(AuthDataSource);
  const router = inject(Router);
  return authDataSource.mustChangePassword() ? router.createUrlTree(['/change-password']) : true;
};
