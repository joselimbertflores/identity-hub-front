import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageModule } from 'primeng/message';

import { PasswordActionDeliveryView } from '../../components/password-action-delivery/password-action-delivery';
import { PasswordActionDelivery, PasswordActionPurpose, UserResponse } from '../../interfaces';
import { UserDataSource } from '../../services';

export type PasswordActionOperation = 'reset' | 'resend';

interface PasswordActionDialogData {
  user: UserResponse;
  operation: PasswordActionOperation;
}

@Component({
  selector: 'app-password-action-dialog',
  imports: [ButtonModule, MessageModule, PasswordActionDeliveryView],
  template: `
    @if (delivery(); as result) {
      <app-password-action-delivery [delivery]="result" [context]="data.operation" />
      <div class="mt-6 flex justify-end border-t border-surface-200 pt-4">
        <p-button label="Cerrar" type="button" (onClick)="close()" />
      </div>
    } @else {
      <div class="space-y-5">
        <div class="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
          <i class="pi pi-exclamation-triangle mt-0.5" aria-hidden="true"></i>
          <div>
            <p class="font-medium">{{ confirmationTitle }}</p>
            <p class="mt-1 text-sm leading-6">{{ confirmationMessage }}</p>
          </div>
        </div>

        @if (errorMessage()) {
          <p-message severity="error" class="w-full" role="alert" aria-live="polite">
            {{ errorMessage() }}
          </p-message>
        }

        <div
          class="flex flex-col-reverse gap-2 border-t border-surface-200 pt-4 sm:flex-row sm:justify-end"
        >
          <p-button
            label="Cancelar"
            type="button"
            severity="secondary"
            [outlined]="true"
            [disabled]="isLoading()"
            (onClick)="close()"
          />
          <p-button
            [label]="confirmLabel"
            type="button"
            [loading]="isLoading()"
            (onClick)="confirm()"
          />
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordActionDialog {
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly userDataSource = inject(UserDataSource);
  readonly data = inject(DynamicDialogConfig<PasswordActionDialogData>).data;

  readonly delivery = signal<PasswordActionDelivery | null>(null);
  readonly updatedUser = signal<UserResponse | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly isLoading = signal(false);

  get confirmationTitle(): string {
    return this.data.operation === 'reset'
      ? `Restablecer la contraseña de ${this.data.user.login}`
      : `${this.resendActionLabel} de ${this.data.user.login}`;
  }

  get confirmationMessage(): string {
    return this.data.operation === 'reset'
      ? 'La contraseña actual dejará de funcionar y se revocarán las sesiones o tokens de renovación correspondientes. El usuario deberá establecer una nueva contraseña mediante el enlace enviado.'
      : `El enlace anterior dejará de funcionar. Se generará uno nuevo con una nueva expiración.${this.currentExpirationMessage}`;
  }

  get confirmLabel(): string {
    return this.data.operation === 'reset' ? 'Restablecer contraseña' : this.resendActionLabel;
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
        const purpose: PasswordActionPurpose =
          this.data.operation === 'reset'
            ? 'PASSWORD_RESET'
            : this.data.user.passwordAction!.purpose;
        this.updatedUser.set({
          ...this.data.user,
          passwordAction: { purpose, expiresAt: passwordAction.expiresAt },
        });
        this.delivery.set(passwordAction);
      },
      error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error)),
    });
  }

  close(): void {
    this.dialogRef.close(this.updatedUser());
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
    return expiration.getTime() <= Date.now()
      ? ` El enlace actual venció el ${formattedExpiration}.`
      : ` El enlace actual vence el ${formattedExpiration}.`;
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Revise su conexión e intente nuevamente.';
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
}
