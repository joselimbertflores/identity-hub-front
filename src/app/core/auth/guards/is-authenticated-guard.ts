import { Router, UrlTree, type CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';

import { delay, map, tap } from 'rxjs';
import { AuthDataSource } from '../auth-data-source';

export const isAuthenticatedGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authDataSource = inject(AuthDataSource);

  return authDataSource.checkAuthStatus().pipe(
    delay(3000),
    map((isAuth): boolean | UrlTree => {
      return isAuth ? true : router.createUrlTree(['/login']);
    }),
  );
};
