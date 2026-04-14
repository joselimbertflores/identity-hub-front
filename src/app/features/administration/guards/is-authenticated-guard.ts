import { Router, type CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';

import { tap } from 'rxjs';

import { AuthDataSource } from '../services';

export const isAuthenticatedGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authDataSource = inject(AuthDataSource);
  return authDataSource.checkAuthStatus().pipe(
    tap((isAuth) => {
      if (!isAuth) {
        router.navigateByUrl('/login');
      }
    })
  );
};
