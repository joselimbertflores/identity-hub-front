import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
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
  imports: [NgIcon, HlmButtonImports, RouterLink],
  template: `
    <main
      class="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10 text-foreground"
    >
      <section
        class="w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card shadow-xl"
      >
        <div class="h-1.5 bg-destructive"></div>

        <div class="px-6 py-8 sm:px-10 sm:py-10">
          <div class="flex justify-center">
            <div
              class="flex size-20 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-8 ring-destructive/10"
            >
              <ng-icon name="lucideTriangleAlert" class="text-[length:--spacing(8)]" />
            </div>
          </div>

          <div class="mt-6 text-center">
            <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
              {{ errorView().title }}
            </h1>

            <p class="mt-4 text-base leading-7 text-muted-foreground">
              {{ errorView().message }}
            </p>
          </div>

          <div
            class="mt-7 rounded-2xl border border-border bg-muted/50 px-4 py-4 text-center"
          >
            <p class="text-xs text-muted-foreground">
              Código de referencia:
              <span class="font-mono font-medium">{{ errorCode() }}</span>
            </p>
          </div>

          <div class="mt-8 flex justify-center">
            <a hlmBtn variant="outline" routerLink="/login" class="w-full sm:w-auto">
              <ng-icon name="lucideLogIn" />
              Volver al inicio de sesión
            </a>
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
