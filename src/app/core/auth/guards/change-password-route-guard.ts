import { Router, UrlTree, type CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';

import { map } from 'rxjs';

import { AuthDataSource } from '../auth-data-source';

export const canAccessChangePasswordGuard: CanActivateFn = () => {
  const auth = inject(AuthDataSource);
  const router = inject(Router);

  return auth.checkAuthStatus().pipe(
    map((isAuth): boolean | UrlTree => {
      if (!isAuth) {
        return router.createUrlTree(['/login']);
      }
      return auth.mustChangePassword() ? true : router.createUrlTree(['/home']);
    }),
  );
};
