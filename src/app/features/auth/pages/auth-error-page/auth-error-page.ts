import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { map } from 'rxjs';

type AuthErrorView = {
  title: string;
  message: string;
};

const AUTH_ERROR_MESSAGES: Record<string, AuthErrorView> = {
  invalid_client: {
    title: 'No se pudo iniciar sesión',
    message:
      'La aplicación que solicitó el acceso no está habilitada o no se encuentra registrada correctamente en Identity Hub.',
  },
  invalid_redirect_uri: {
    title: 'No se pudo continuar con el inicio de sesión',
    message:
      'La solicitud de acceso no pudo ser validada. Es posible que la aplicación de origen no esté configurada correctamente.',
  },
  invalid_request: {
    title: 'Solicitud no válida',
    message: 'La solicitud de inicio de sesión está incompleta o contiene información inválida.',
  },
  expired_auth_request: {
    title: 'Solicitud expirada',
    message: 'La solicitud de inicio de sesión expiró antes de completarse. Vuelva a intentarlo.',
  },
  unsupported_response_type: {
    title: 'Solicitud no soportada',
    message:
      'La aplicación solicitó un tipo de autenticación que no está disponible en Identity Hub.',
  },
};

const DEFAULT_ERROR: AuthErrorView = {
  title: 'No se pudo completar el inicio de sesión',
  message:
    'Ocurrió un problema durante el proceso de autenticación. Vuelva a intentarlo o comuníquese con el administrador del sistema.',
};

@Component({
  selector: 'app-auth-error-page',
  imports: [ButtonModule, TagModule, RouterLink],
  template: `
    <main
      class="min-h-screen bg-surface-50 text-surface-900 flex items-center justify-center px-4 py-10"
    >
      <section
        class="w-full max-w-lg overflow-hidden rounded-3xl border border-surface-200 bg-surface-0 shadow-xl"
      >
        <div class="h-1.5 bg-red-500"></div>

        <div class="px-6 py-8 sm:px-10 sm:py-10">
          <div class="flex justify-center">
            <div
              class="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600 ring-8 ring-red-100"
            >
              <i class="pi pi-exclamation-triangle" style="font-size:32px;"></i>
            </div>
          </div>

          <div class="mt-6 text-center">
            <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
              {{ errorView().title }}
            </h1>

            <p class="mt-4 text-base leading-7 text-surface-600">
              {{ errorView().message }}
            </p>
          </div>

          <div
            class="mt-7 rounded-2xl border border-surface-200 bg-surface-50 px-4 py-4 text-center"
          >
            <p class="text-xs text-surface-500">
              Código de referencia:
              <span class="font-mono font-medium">{{ errorCode() }}</span>
            </p>
          </div>

          <div class="mt-8 flex justify-center">
            <p-button
              [outlined]="true"
              label="Volver al inicio de sesión"
              icon="pi pi-sign-in"
              routerLink="/login"
              styleClass="w-full sm:w-auto"
            />
          </div>
        </div>
      </section>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AuthErrorPage {
  private readonly route = inject(ActivatedRoute);

  readonly errorCode = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('error') ?? 'unknown_error')),
    { initialValue: 'unknown_error' },
  );

  readonly errorView = computed(() => AUTH_ERROR_MESSAGES[this.errorCode()] ?? DEFAULT_ERROR);
}
