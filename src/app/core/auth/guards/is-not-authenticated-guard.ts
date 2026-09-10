import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { AuthDataSource } from '../auth-data-source';

export const isNotAuthenticatedGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authDataSource = inject(AuthDataSource);
  const authRequestId = route.queryParamMap.get('auth_request_id');

  return authDataSource.checkAuthStatus().pipe(
    switchMap((isAuth) => {
      if (!isAuth) return of(true);

      if (authRequestId) {
        return authDataSource.resumeOAuth(authRequestId).pipe(
          map(({ redirectUrl }) => {
            const baseUrl = environment.identityHubUrl || window.location.origin;
            window.location.assign(new URL(redirectUrl, baseUrl).href);
            return false;
          }),
          catchError(() => of(true)),
        );
      }

      return of(router.createUrlTree(['/home']));
    }),
  );
};
