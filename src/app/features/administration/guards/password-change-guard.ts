import { inject } from '@angular/core';
import { Router, type CanActivateChildFn, type CanActivateFn } from '@angular/router';

import { AuthDataSource } from '../services';

const REQUIRED_PASSWORD_CHANGE_URL = '/home/change-password';

export const mustChangePasswordGuard: CanActivateChildFn = (_route, state) => {
  const router = inject(Router);
  const user = inject(AuthDataSource).user();

  if (user?.mustChangePassword && state.url.split('?')[0] !== REQUIRED_PASSWORD_CHANGE_URL) {
    return router.createUrlTree([REQUIRED_PASSWORD_CHANGE_URL]);
  }

  return true;
};

export const requiredPasswordChangeGuard: CanActivateFn = () => {
  const router = inject(Router);
  const user = inject(AuthDataSource).user();

  if (user?.mustChangePassword) return true;

  return router.createUrlTree(['/home/settings']);
};
