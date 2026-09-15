import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { NgIcon } from '@ng-icons/core';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';

import { AuthDataSource } from '../../../../core';

const GENERIC_RESULT =
  'Si encontramos una cuenta válida con correo registrado, recibirás instrucciones para recuperar el acceso.';

@Component({
  selector: 'app-forgot-password-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    NgIcon,
    HlmAlertImports,
    HlmButtonImports,
    HlmFieldImports,
    HlmInputImports,
    HlmSpinnerImports,
  ],
  template: `
    <main class="flex min-h-screen flex-col bg-muted/30 text-foreground">
      <section class="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div class="w-full max-w-md">
          <div class="rounded-xl border border-border bg-card px-5 py-7 shadow-md sm:px-8 sm:py-9">
            <div class="flex flex-col items-center text-center">
              <img
                src="/identity-hub-mark.svg"
                alt=""
                aria-hidden="true"
                class="size-18 sm:size-20"
              />
              <h1 class="mt-2 text-xl font-semibold text-foreground sm:text-2xl">
                Recuperar acceso
              </h1>
              <p class="mt-2 text-sm leading-6 text-muted-foreground">
                Ingresa tu nombre de usuario o correo.
              </p>
            </div>

            @if (sent()) {
              <div class="mt-8 flex flex-col gap-5">
                <div hlmAlert role="status" aria-live="polite">
                  <ng-icon name="lucideCircleCheck" class="text-primary" />
                  <div>
                    <h2 hlmAlertTitle>Solicitud recibida</h2>
                    <p hlmAlertDescription>{{ genericResult }}</p>
                  </div>
                </div>
                <p class="text-center text-sm text-muted-foreground">
                  Si no tienes un correo registrado, comunícate con Sistemas.
                </p>
                <a hlmBtn routerLink="/login" class="w-full">Volver al inicio de sesión</a>
              </div>
            } @else {
              <form
                class="mt-8 flex flex-col gap-5"
                [formGroup]="form"
                (ngSubmit)="submit()"
                novalidate
              >
                <div hlmField>
                  <label hlmFieldLabel for="identifier">Usuario o correo</label>
                  <input
                    hlmInput
                    id="identifier"
                    type="text"
                    autocomplete="username"
                    formControlName="identifier"
                    placeholder="Usuario o correo"
                  />
                  <p hlmFieldDescription>
                    Si utilizabas Seguimiento de Trámites, puedes usar el mismo nombre de usuario.
                  </p>
                  @if (form.controls.identifier.touched && form.controls.identifier.invalid) {
                    <hlm-field-error>Ingrese su usuario o correo.</hlm-field-error>
                  }
                </div>

                @if (errorMessage()) {
                  <div hlmAlert variant="destructive" aria-live="polite">
                    <ng-icon name="lucideTriangleAlert" />
                    <div>
                      <h2 hlmAlertTitle>Error</h2>
                      <p hlmAlertDescription>{{ errorMessage() }}</p>
                    </div>
                  </div>
                }

                <button
                  hlmBtn
                  class="w-full"
                  type="submit"
                  [disabled]="form.invalid || isSubmitting()"
                >
                  @if (isSubmitting()) {
                    <hlm-spinner />
                  }
                  Enviar instrucciones
                </button>
              </form>
              <div class="mt-6 border-t border-border pt-4 text-center">
                <a routerLink="/login" class="text-sm font-medium text-primary hover:underline">
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
