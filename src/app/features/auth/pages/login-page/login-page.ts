import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';

import { environment } from '../../../../../environments/environment';

const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'Usuario o contraseña incorrectos.',
  user_disabled: 'El usuario ha sido deshabilitado.',
};

@Component({
  selector: 'app-login-page',
  imports: [
    ReactiveFormsModule,
    NgIcon,
    HlmAlertImports,
    HlmButtonImports,
    HlmCheckboxImports,
    HlmFieldImports,
    HlmInputImports,
    HlmInputGroupImports,
    HlmSpinnerImports,
    RouterLink,
  ],
  template: `
    <main class="flex min-h-screen flex-col bg-muted/30 text-foreground">
      <section
        class="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8"
        aria-labelledby="login-title"
      >
        <div class="w-full max-w-md">
          <div
            class="rounded-xl border border-border bg-card px-5 pt-7 pb-5 shadow-md sm:px-8 sm:pt-8 sm:pb-5"
          >
            <div class="flex flex-col items-center text-center">
              <img
                src="/identity-hub-mark.svg"
                alt=""
                aria-hidden="true"
                class="size-18 sm:size-20"
              />

              <h1
                id="login-title"
                class="mt-2 text-2xl font-semibold leading-tight text-foreground sm:text-3xl"
              >
                SIAU
              </h1>

              <p class="mt-1 text-sm leading-5 text-muted-foreground sm:text-base">
                Sistema de Identidad y Acceso Unificado
              </p>
            </div>

            <form
              class="mt-6 flex flex-col gap-5"
              [formGroup]="loginForm"
              (ngSubmit)="login()"
              novalidate
            >
              <fieldset hlmFieldSet>
                <legend hlmFieldLegend class="sr-only">Credenciales de acceso</legend>
                <div hlmFieldGroup>

                <div hlmField>
                  <label hlmFieldLabel for="login">Nombre de usuario</label>
                  <input
                    hlmInput
                    id="login"
                    type="text"
                    placeholder="Ingrese su nombre de usuario"
                    autocomplete="username"
                    formControlName="login"
                  />
                </div>

                <div hlmField>
                  <label hlmFieldLabel for="password">Contraseña</label>
                  <div hlmInputGroup>
                    <input hlmInputGroupInput id="password" [type]="hidePassword ? 'password' : 'text'" placeholder="Ingrese su contraseña" autocomplete="current-password" formControlName="password" />
                    <span hlmInputGroupAddon align="inline-end">
                      <button hlmInputGroupButton size="icon-xs" type="button" aria-label="Mostrar u ocultar contraseña" (click)="hidePassword = !hidePassword">
                        <ng-icon [name]="hidePassword ? 'lucideEye' : 'lucideEyeOff'" />
                      </button>
                    </span>
                  </div>
                </div>

                <div hlmField orientation="horizontal">
                  <hlm-checkbox
                    inputId="rememberme"
                    formControlName="remember"
                  />
                  <label hlmFieldLabel for="rememberme">
                    Recordar nombre de usuario
                  </label>
                </div>
                </div>
              </fieldset>

              <div class="text-right">
                <a
                  routerLink="/forgot-password"
                  class="text-sm font-medium text-primary hover:underline"
                >
                  Olvidé mi contraseña
                </a>
              </div>

              @if (errorMessage()) {
                <div hlmAlert variant="destructive" aria-live="polite">
                  <ng-icon name="lucideTriangleAlert" />
                  <div><h3 hlmAlertTitle>Error</h3><p hlmAlertDescription>{{ errorMessage() }}</p></div>
                </div>
              }

              @if (successMessage()) {
                <div hlmAlert role="status" aria-live="polite">
                  <ng-icon name="lucideCircleCheck" class="text-primary" />
                  <div><h3 hlmAlertTitle>Operación completada</h3><p hlmAlertDescription>{{ successMessage() }}</p></div>
                </div>
              }

              <button hlmBtn class="w-full" type="submit" [disabled]="loginForm.invalid || isSubmitting()">
                @if (isSubmitting()) { <hlm-spinner /> }
                Ingresar
              </button>
            </form>

            <footer class="mt-6 border-t border-border pt-4">
              <div
                class="flex items-center justify-center gap-3 text-center text-muted-foreground"
              >
                <img
                  src="/sacaba-mark.svg"
                  alt=""
                  aria-hidden="true"
                  class="size-9 shrink-0"
                />
                <p class="max-w-56 text-xs leading-5">
                  Gobierno Autónomo Municipal de Sacaba
                </p>
              </div>
            </footer>
          </div>
        </div>
      </section>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginPage {
  private _formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  hidePassword = true;
  loginForm: FormGroup = this._formBuilder.group({
    login: ['', Validators.required],
    password: ['', Validators.required],
    remember: [false],
  });

  isSubmitting = signal(false);

  ngOnInit(): void {
    this.loadForm();
    this.handleLoginErrorMessages();
    this.handlePasswordActionCompleted();
  }

  login() {
    if (this.loginForm.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);

    const { login, password, remember } = this.loginForm.value;
    this.loginForm.disable({ emitEvent: false });

    const url = new URL(window.location.href);

    const authRequestId = url.searchParams.get('auth_request_id');

    const form = document.createElement('form');
    form.method = 'POST';

    let action = `${environment.identityHubUrl}/oauth/login`;

    if (authRequestId) {
      action += `?auth_request_id=${encodeURIComponent(authRequestId)}`;
    }

    form.action = action;
    form.style.display = 'none';

    const addField = (name: string, value: string) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    };

    addField('login', login);
    addField('password', password);

    document.body.appendChild(form);
    if (remember) {
      localStorage.setItem('login', login);
    } else {
      localStorage.removeItem('login');
    }
    form.submit();
  }

  private loadForm(): void {
    const loginSaved = localStorage.getItem('login');
    if (loginSaved) {
      this.loginForm.patchValue({ login: loginSaved, remember: true });
    }
  }

  private handleLoginErrorMessages() {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const error = params.get('error');
      if (error) {
        const message = ERROR_MESSAGES[error] ?? 'No se pudo iniciar sesión.';
        this.showMessage(message, 5000);

        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { error: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }
    });
  }

  private handlePasswordActionCompleted(): void {
    const navigationState = window.history.state as { passwordActionCompleted?: unknown };
    if (navigationState.passwordActionCompleted === true) {
      this.successMessage.set(
        'La contraseña fue establecida correctamente. Ya puede iniciar sesión.',
      );
    }
  }

  private showMessage(text: string, life = 3000): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    this.errorMessage.set(text);
    this.hideTimer = setTimeout(() => {
      this.errorMessage.set(null);
      this.hideTimer = null;
    }, life);
  }
}
