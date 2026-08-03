import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';

import { MessageModule } from 'primeng/message';

import { AuthDataSource } from '../../../../core';
import { ChangePasswordRequest } from '../../../../core/auth/auth.types';
import { PasswordChangeForm } from '../../../auth/components/password-change-form/password-change-form';
import { getAuthErrorMessage } from '../../../auth/utils/auth-error';

@Component({
  selector: 'app-settings-page',
  imports: [MessageModule, PasswordChangeForm],
  templateUrl: './settings-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SettingsPage {
  private readonly authDataSource = inject(AuthDataSource);
  private readonly route = inject(ActivatedRoute);
  private readonly passwordForm = viewChild(PasswordChangeForm);

  readonly user = this.authDataSource.user;
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly isSaving = signal(false);

  save(request: ChangePasswordRequest): void {
    if (this.isSaving()) return;

    const authRequestId = this.route.snapshot.queryParamMap.get('auth_request_id') ?? undefined;
    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.authDataSource
      .changePassword(request, authRequestId)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: ({ redirectUrl }) => {
          this.passwordForm()?.reset();
          if (authRequestId) {
            window.location.assign(redirectUrl);
            return;
          }
          this.successMessage.set('La contraseña fue cambiada correctamente.');
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(getAuthErrorMessage(error)),
      });
  }
}
