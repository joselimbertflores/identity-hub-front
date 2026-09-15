import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { NgIcon } from '@ng-icons/core';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogFooter, HlmDialogHeader, HlmDialogTitle } from '@spartan-ng/helm/dialog';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';

import { PasswordActionDeliveryView } from '../../components/password-action-delivery/password-action-delivery';
import { PasswordActionDelivery, UserResponse } from '../../interfaces';
import { UserDataSource } from '../../services';

export type PasswordActionOperation = 'reset' | 'resend';

export interface PasswordActionDialogData {
  user: UserResponse;
  operation: PasswordActionOperation;
}

@Component({
  selector: 'app-password-action-dialog',
  imports: [
    NgIcon,
    HlmAlertImports,
    HlmButtonImports,
    HlmDialogFooter,
    HlmDialogHeader,
    HlmDialogTitle,
    HlmSpinnerImports,
    PasswordActionDeliveryView,
  ],
  host: { class: 'flex flex-col gap-4' },
  template: `
    <hlm-dialog-header>
      <h2 hlmDialogTitle>{{ dialogTitle }}</h2>
    </hlm-dialog-header>
    @if (delivery(); as result) {
      <app-password-action-delivery [delivery]="result" [context]="data.operation" />
      <hlm-dialog-footer class="mt-2 border-t border-border pt-4">
        <button hlmBtn type="button" (click)="close()">Cerrar</button>
      </hlm-dialog-footer>
    } @else {
      <div class="flex flex-col gap-5">
        <div hlmAlert>
          <ng-icon name="lucideTriangleAlert" />
          <div>
            <h3 hlmAlertTitle>{{ confirmationTitle }}</h3>
            <p hlmAlertDescription>{{ confirmationMessage }}</p>
          </div>
        </div>

        @if (errorMessage()) {
          <div hlmAlert variant="destructive" aria-live="polite">
            <ng-icon name="lucideTriangleAlert" />
            <div>
              <h3 hlmAlertTitle>Error</h3>
              <p hlmAlertDescription>{{ errorMessage() }}</p>
            </div>
          </div>
        }

        <hlm-dialog-footer class="border-t border-border pt-4">
          <button hlmBtn variant="outline" type="button" [disabled]="isLoading()" (click)="close()">
            Cancelar
          </button>
          <button hlmBtn type="button" [disabled]="isLoading()" (click)="confirm()">
            @if (isLoading()) {
              <hlm-spinner />
            }
            {{ confirmLabel }}
          </button>
        </hlm-dialog-footer>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordActionDialog {
  private readonly dialogRef = inject<BrnDialogRef<boolean>>(BrnDialogRef);
  private readonly userDataSource = inject(UserDataSource);
  readonly data = injectBrnDialogContext<PasswordActionDialogData>();

  readonly delivery = signal<PasswordActionDelivery | null>(null);
  readonly completed = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isLoading = signal(false);

  get dialogTitle(): string {
    return this.data.operation === 'reset'
      ? 'Forzar restablecimiento de contraseña'
      : this.data.user.passwordAction?.purpose === 'INITIAL_SETUP'
        ? 'Reenviar enlace de configuración'
        : 'Reenviar enlace de restablecimiento';
  }

  get confirmationTitle(): string {
    return this.data.operation === 'reset'
      ? `Forzar el restablecimiento de ${this.data.user.login}`
      : `${this.resendActionLabel} de ${this.data.user.login}`;
  }

  get confirmationMessage(): string {
    return this.data.operation === 'reset'
      ? 'La contraseña actual dejará de funcionar y se revocarán las sesiones o tokens de renovación correspondientes. El usuario deberá establecer una nueva contraseña y se intentarán enviar instrucciones a su correo registrado.'
      : `El enlace anterior dejará de funcionar. Se generará uno nuevo con una nueva expiración.${this.currentExpirationMessage}`;
  }

  get confirmLabel(): string {
    return this.data.operation === 'reset' ? 'Forzar restablecimiento' : this.resendActionLabel;
  }

  confirm(): void {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const request =
      this.data.operation === 'reset'
        ? this.userDataSource.resetPassword(this.data.user.id)
        : this.userDataSource.resendPasswordAction(this.data.user.id);

    request.pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: ({ passwordAction }) => {
        this.completed.set(true);
        this.delivery.set(passwordAction);
      },
      error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error)),
    });
  }

  close(): void {
    this.dialogRef.close(this.completed());
  }

  private get resendActionLabel(): string {
    return this.data.user.passwordAction?.purpose === 'INITIAL_SETUP'
      ? 'Reenviar enlace de configuración'
      : 'Reenviar enlace de restablecimiento';
  }

  private get currentExpirationMessage(): string {
    const expiresAt = this.data.user.passwordAction?.expiresAt;
    if (!expiresAt) return '';

    const expiration = new Date(expiresAt);
    if (Number.isNaN(expiration.getTime())) return '';

    const formattedExpiration = new Intl.DateTimeFormat('es-BO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(expiration);
    return ` El enlace actual vence el ${formattedExpiration}.`;
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Revise su conexión e intente nuevamente.';
    }
    if (this.getErrorCode(error) === 'USER_EMAIL_REQUIRED') {
      return 'Debes registrar un correo antes de enviar instrucciones de acceso.';
    }
    if (error.status === 404) {
      return this.data.operation === 'resend'
        ? 'El usuario no tiene una acción de contraseña pendiente para reenviar.'
        : 'No se encontró el usuario.';
    }
    if (error.status === 409) {
      return 'La información cambió mientras se procesaba la solicitud. Cierre el diálogo, actualice la lista e intente nuevamente.';
    }
    return 'No se pudo completar la operación. Intente nuevamente.';
  }

  private getErrorCode(error: HttpErrorResponse): string | null {
    if (!error.error || typeof error.error !== 'object') return null;
    const body = error.error as { code?: unknown };
    return typeof body.code === 'string' ? body.code : null;
  }
}
