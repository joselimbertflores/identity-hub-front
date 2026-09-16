import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthDataSource } from './auth-data-source';

const apiUrl = `${environment.identityHubUrl}/api/`;
const authUrl = `${apiUrl}auth/`;
const publicAuthUrls = new Set([
  `${authUrl}forgot-password`,
  `${authUrl}password-actions/complete`,
  `${authUrl}logout`,
]);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authDataSource = inject(AuthDataSource);
  const router = inject(Router);
  const reqWithHeader = req.clone({
    withCredentials: true,
  });
  return next(reqWithHeader).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        req.url.startsWith(apiUrl) &&
        !publicAuthUrls.has(req.url)
      ) {
        authDataSource.clearAuthState();

        // The route guards already redirect when their status request is unauthorized.
        if (req.url !== `${authUrl}status`) {
          void router.navigateByUrl('/login');
        }
      }

      return throwError(() => error);
    }),
  );
};
