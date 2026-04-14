import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

import { AuthDataSource } from '../services';

export const roleGuard: CanActivateFn = (route, state) => {
  const user = inject(AuthDataSource).user();
  const router = inject(Router);

  const expectedRoles = route.data['roles'] as string[] | undefined;
  if (!expectedRoles) return true;
  const hasPermission = user?.roles.some((role) => expectedRoles.includes(role));
  if (hasPermission) return true;
  return router.createUrlTree(['/home']);
};
