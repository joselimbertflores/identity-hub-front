import { HttpErrorResponse } from '@angular/common/http';

const ERROR_MESSAGES: Record<string, string> = {
  'Current password is incorrect': 'La contraseña actual es incorrecta.',
  'Password confirmation does not match.': 'Las contraseñas no coinciden.',
  'Credentials changed while processing the request':
    'Las credenciales cambiaron mientras se procesaba la solicitud. Revise los datos e intente nuevamente.',
  'The password action code is invalid or expired.': 'El código no es válido o ha vencido.',
};

export function getAuthErrorMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'No se pudo conectar con el servidor. Revise su conexión e intente nuevamente.';
  }

  const detail = getErrorDetail(error);
  if (detail && ERROR_MESSAGES[detail]) return ERROR_MESSAGES[detail];

  if (error.status === 409) {
    return 'La información cambió mientras se procesaba la solicitud. Intente nuevamente.';
  }

  return detail ?? 'No se pudo completar la solicitud. Intente nuevamente.';
}

function getErrorDetail(error: HttpErrorResponse): string | null {
  if (!error.error || typeof error.error !== 'object') return null;

  const body = error.error as { message?: unknown };
  if (typeof body.message === 'string') return body.message;
  if (Array.isArray(body.message)) {
    return body.message.filter((item): item is string => typeof item === 'string').join(' ');
  }

  return null;
}
