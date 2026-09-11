import type { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { toast } from '@spartan-ng/brain/sonner';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // * For skipping the toast, the request should be made with a context like:
      // const skipToast = req.context.get(SKIP_ERROR_TOAST);
      const toastConfig = getToastConfig(error);
      if (toastConfig) {
        toast[toastConfig.type](toastConfig.title, { description: toastConfig.description });
      }
      return throwError(() => error);
    }),
  );
};

type ErrorToast = {
  type: 'error' | 'warning';
  title: string;
  description: string;
};

function getToastConfig(error: HttpErrorResponse): ErrorToast | null {
  const detail = getErrorDetail(error);

  switch (error.status) {
    case 0:
      return {
        type: 'error',
        title: 'Sin conexión',
        description: 'No se pudo conectar con el servidor.',
      };

    case 400:
      return {
        type: 'warning',
        title: 'Solicitud incorrecta',
        description: detail,
      };

    case 403:
      return {
        type: 'warning',
        title: 'Acceso denegado',
        description: detail,
      };

    case 409:
      return {
        type: 'warning',
        title: 'Solicitud inválida',
        description: detail,
      };

    case 500:
      return {
        type: 'error',
        title: 'Error interno',
        description: 'No se pudo procesar la solicitud.',
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
