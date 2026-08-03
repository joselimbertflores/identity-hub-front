import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthDataSource } from '../../../../core';
import { ChangePasswordRequest } from '../../../../core/auth/auth.types';
import { PasswordChangeForm } from '../../components/password-change-form/password-change-form';
import { getAuthErrorMessage } from '../../utils/auth-error';

@Component({
  selector: 'app-change-password-page',
  imports: [PasswordChangeForm],
  templateUrl: './change-password-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChangePasswordPage {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authDataSource = inject(AuthDataSource);
  private readonly passwordForm = viewChild(PasswordChangeForm);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  private readonly authRequestId =
    this.route.snapshot.queryParamMap.get('auth_request_id') ?? undefined;

  submit(request: ChangePasswordRequest): void {
    if (this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.authDataSource
      .changePassword(request, this.authRequestId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ redirectUrl }) => {
          this.passwordForm()?.reset();
          this.navigateToRedirect(redirectUrl);
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(getAuthErrorMessage(error)),
      });
  }

  private navigateToRedirect(redirectUrl: string): void {
    try {
      const target = new URL(redirectUrl, window.location.origin);
      if (target.protocol === 'http:' || target.protocol === 'https:') {
        window.location.assign(target.href);
        return;
      }
    } catch {
      // A malformed backend redirect falls back to the authenticated home.
    }

    void this.router.navigateByUrl('/home/welcome');
  }
}
