import { Router, type CanActivateChildFn } from '@angular/router';
import { inject } from '@angular/core';

import { AuthDataSource } from '../auth-data-source';

export const mustChangePasswordGuard: CanActivateChildFn = (route) => {
  const authDataSource = inject(AuthDataSource);
  const router = inject(Router);
  if (!authDataSource.mustChangePassword()) return true;

  const authRequestId = route.queryParamMap.get('auth_request_id');
  return router.createUrlTree(['/change-password'], {
    queryParams: authRequestId ? { auth_request_id: authRequestId } : undefined,
  });
};
