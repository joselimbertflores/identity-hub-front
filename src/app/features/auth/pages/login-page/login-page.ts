import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { Message } from 'primeng/message';

import { environment } from '../../../../../environments/environment';
import { AppIcon } from '../../../../shared';

const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'Usuario o contraseña incorrectos.',
  user_disabled: 'El usuario ha sido deshabilitado.',
};

@Component({
  selector: 'app-login-page',
  imports: [
    ReactiveFormsModule,
    CheckboxModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    Message,
    AppIcon,
  ],
  template: `
    <main class="flex min-h-screen flex-col bg-surface-50 text-surface-900">
      <section
        class="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8"
        aria-labelledby="login-title"
      >
        <div class="w-full max-w-md">
          <div
            class="rounded-xl border border-surface-200 bg-surface-0 px-5 py-7 shadow-md sm:px-8 sm:py-9"
          >
            <div class="flex flex-col items-center text-center">
              <app-icon class="h-14 w-14 text-primary-600 sm:h-16 sm:w-16" />

              <h1
                id="login-title"
                class="mt-2 text-xl font-semibold leading-tight text-surface-950 sm:text-2xl"
              >
                Sistema de Autenticación Institucional
              </h1>

              <p id="login-description" class="mt-2 text-sm leading-6 text-surface-600">
                Ingrese con sus credenciales institucionales para continuar.
              </p>
            </div>

            <form
              class="mt-8 space-y-5"
              [formGroup]="loginForm"
              (ngSubmit)="login()"
              aria-describedby="login-description"
              novalidate
            >
              <fieldset class="space-y-5">
                <legend class="sr-only">Credenciales de acceso</legend>

                <div class="space-y-1.5">
                  <label for="login" class="block text-sm font-medium leading-6 text-surface-900">
                    Nombre de usuario
                  </label>
                  <input
                    pInputText
                    id="login"
                    type="text"
                    placeholder="Ingrese su nombre de usuario"
                    class="w-full"
                    autocomplete="username"
                    formControlName="login"
                    [disabled]="isSubmitting()"
                  />
                </div>

                <div class="space-y-1.5">
                  <label
                    for="password"
                    class="block text-sm font-medium leading-6 text-surface-900"
                  >
                    Contraseña
                  </label>
                  <input
                    pInputText
                    id="password"
                    type="password"
                    placeholder="Ingrese su contraseña"
                    class="w-full"
                    autocomplete="current-password"
                    formControlName="password"
                    [disabled]="isSubmitting()"
                  />
                </div>

                <div class="flex items-center gap-3 pt-1">
                  <p-checkbox
                    id="rememberme"
                    formControlName="remember"
                    [binary]="true"
                    [disabled]="isSubmitting()"
                  ></p-checkbox>
                  <label for="rememberme" class="text-sm leading-6 text-surface-700">
                    Recordar nombre de usuario
                  </label>
                </div>
              </fieldset>

              @if (errorMessage()) {
                <p-message
                  severity="error"
                  class="w-full"
                  aria-live="polite"
                  role="alert"
                  icon="pi pi-times-circle"
                >
                  {{ errorMessage() }}
                </p-message>
              }

              <p-button type="submit" label="Ingresar" [loading]="isSubmitting()" [fluid]="true" />
            </form>

            <div class="mt-6 border-t border-surface-200 pt-4 text-center">
              <div class="flex items-center gap-2 justify-center">
                <img
                  src="images/logos/escudo.webp"
                  alt="Gobierno Autónomo Municipal de Sacaba"
                  class="h-8 w-auto opacity-80"
                />
                <p class="mt-1 text-xs text-surface-600">Gobierno Autónomo Municipal de Sacaba</p>
              </div>
            </div>
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
  }

  login() {
    if (this.loginForm.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);

    const { login, password, remember } = this.loginForm.value;

    const url = new URL(window.location.href);

    const authRequestId = url.searchParams.get('auth_request_id');

    const form = document.createElement('form');
    form.method = 'POST';

    let action = `${environment.baseUrl}/oauth/login`;
    if (authRequestId) {
      action += `?auth_request_id=${authRequestId}`;
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

        this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
      }
    });
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
