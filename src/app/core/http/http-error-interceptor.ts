import type { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { MessageService, ToastMessageOptions } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // * For skipping the toast, the request should be made with a context like:
      // const skipToast = req.context.get(SKIP_ERROR_TOAST);
      const messageConfig = getMessageConfig(error);
      if (messageConfig) {
        messageService.add(messageConfig);
      }
      return throwError(() => error);
    }),
  );
};

function getMessageConfig(error: HttpErrorResponse): ToastMessageOptions | null {
  const detail = getErrorDetail(error);

  switch (error.status) {
    case 0:
      return {
        severity: 'error',
        summary: 'Sin conexión',
        detail: 'No se pudo conectar con el servidor.',
      };

    case 400:
      return {
        severity: 'warn',
        summary: 'Solicitud incorrecta',
        detail,
      };

    case 403:
      return {
        severity: 'warn',
        summary: 'Acceso denegado',
        detail,
      };

    case 409:
      return {
        severity: 'warn',
        summary: 'Solicitud inválida',
        detail,
      };

    case 500:
      return {
        severity: 'error',
        summary: 'Error interno',
        detail,
      };

    default:
      return null;
  }
}

function getErrorDetail(error: HttpErrorResponse): string {
  const fallback = 'No se pudo procesar la solicitud.';

  if (!error.error) return fallback;

  if (typeof error.error === 'string') {
    return error.error;
  }

  const message = error.error.message;

  if (Array.isArray(message)) {
    return message.join(', ');
  }

  if (typeof message === 'string') {
    return message;
  }

  return fallback;
}
