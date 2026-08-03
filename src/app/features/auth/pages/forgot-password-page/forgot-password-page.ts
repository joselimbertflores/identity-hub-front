import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

import { AuthDataSource } from '../../../../core';
import { AppIcon } from '../../../../shared';

const GENERIC_RESULT =
  'Si la cuenta puede recuperarse, enviaremos instrucciones al correo registrado.';

@Component({
  selector: 'app-forgot-password-page',
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule, MessageModule, AppIcon],
  template: `
    <main class="flex min-h-screen flex-col bg-surface-50 text-surface-900">
      <section class="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div class="w-full max-w-md">
          <div
            class="rounded-xl border border-surface-200 bg-surface-0 px-5 py-7 shadow-md sm:px-8 sm:py-9"
          >
            <div class="flex flex-col items-center text-center">
              <app-icon class="h-14 w-14 text-primary-600 sm:h-16 sm:w-16" />
              <h1 class="mt-2 text-xl font-semibold text-surface-950 sm:text-2xl">
                Recuperar contraseña
              </h1>
              <p class="mt-2 text-sm leading-6 text-surface-600">
                Ingrese su nombre de usuario o correo institucional.
              </p>
            </div>

            @if (sent()) {
              <div class="mt-8 space-y-5">
                <p-message severity="success" class="w-full" role="status" aria-live="polite">
                  {{ genericResult }}
                </p-message>
                <p-button label="Volver al inicio de sesión" routerLink="/login" [fluid]="true" />
              </div>
            } @else {
              <form class="mt-8 space-y-5" [formGroup]="form" (ngSubmit)="submit()" novalidate>
                <div class="space-y-1.5">
                  <label for="identifier" class="block text-sm font-medium text-surface-900">
                    Usuario o correo
                  </label>
                  <input
                    pInputText
                    id="identifier"
                    type="text"
                    class="w-full"
                    autocomplete="username"
                    formControlName="identifier"
                    placeholder="Usuario o correo institucional"
                  />
                  @if (form.controls.identifier.touched && form.controls.identifier.invalid) {
                    <small class="text-red-600">Ingrese su usuario o correo.</small>
                  }
                </div>

                @if (errorMessage()) {
                  <p-message severity="error" class="w-full" role="alert" aria-live="polite">
                    {{ errorMessage() }}
                  </p-message>
                }

                <p-button
                  type="submit"
                  label="Solicitar recuperación"
                  [loading]="isSubmitting()"
                  [disabled]="form.invalid || isSubmitting()"
                  [fluid]="true"
                />
              </form>
              <div class="mt-6 border-t border-surface-200 pt-4 text-center">
                <a
                  routerLink="/login"
                  class="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
                >
                  Volver al inicio de sesión
                </a>
              </div>
            }
          </div>
        </div>
      </section>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ForgotPasswordPage {
  private readonly authDataSource = inject(AuthDataSource);
  private readonly formBuilder = inject(FormBuilder);

  readonly genericResult = GENERIC_RESULT;
  readonly isSubmitting = signal(false);
  readonly sent = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly form = this.formBuilder.nonNullable.group({
    identifier: ['', [Validators.required, Validators.maxLength(320)]],
  });

  submit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.form.disable({ emitEvent: false });
    this.errorMessage.set(null);
    this.authDataSource
      .forgotPassword(this.form.getRawValue())
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          if (!this.sent()) this.form.enable({ emitEvent: false });
        }),
      )
      .subscribe({
        next: () => {
          this.form.reset();
          this.sent.set(true);
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 0) {
            this.errorMessage.set(
              'No se pudo conectar con el servidor. Revise su conexión e intente nuevamente.',
            );
            return;
          }
          this.form.reset();
          this.sent.set(true);
        },
      });
  }
}
