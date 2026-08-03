import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { catchError, map, of, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AuthUserResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  CompletePasswordActionRequest,
  ForgotPasswordRequest,
  MessageResponse,
} from './auth.types';

@Injectable({
  providedIn: 'root',
})
export class AuthDataSource {
  readonly URL = `${environment.identityHubUrl}/api/auth`;
  private http = inject(HttpClient);

  private _user = signal<AuthUserResponse | null>(null);
  user = computed(() => this._user());

  private _mustChangePassword = linkedSignal(() => this._user()?.mustChangePassword ?? false);
  mustChangePassword = computed(() => this._mustChangePassword());

  checkAuthStatus() {
    return this.http.get<{ user: AuthUserResponse }>(`${this.URL}/status`).pipe(
      tap(({ user }) => {
        this._user.set(user);
      }),
      map(() => true),
      catchError(() => {
        return of(false);
      }),
    );
  }

  changePassword(request: ChangePasswordRequest, authRequestId?: string) {
    const params = authRequestId
      ? new HttpParams().set('auth_request_id', authRequestId)
      : undefined;

    return this.http
      .patch<ChangePasswordResponse>(`${this.URL}/change-password`, request, { params })
      .pipe(
        tap(() => {
          this._mustChangePassword.set(false);
        }),
      );
  }

  forgotPassword(request: ForgotPasswordRequest) {
    return this.http.post<MessageResponse>(`${this.URL}/forgot-password`, request);
  }

  completePasswordAction(request: CompletePasswordActionRequest) {
    return this.http.post<MessageResponse>(`${this.URL}/password-actions/complete`, request);
  }

  logout() {
    return this.http.post(`${this.URL}/logout`, {}, { withCredentials: true });
  }
}
