import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { map } from 'rxjs';

import { AuthDataSource } from '../services';

export const isNotAuthenticatedGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authDataSource = inject(AuthDataSource);
  return authDataSource.checkAuthStatus().pipe(
    map((isAuth) => {
      if (isAuth) {
        return router.createUrlTree(['/home']);
      }
      return true;
    })
  );
};
