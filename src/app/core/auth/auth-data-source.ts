import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { catchError, map, of, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthUserResponse } from './auth.types';

@Injectable({
  providedIn: 'root',
})
export class AuthDataSource {
  readonly URL = `${environment.baseUrl}/auth`;
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

  changePassword(password: string) {
    return this.http
      .patch<{ message: string }>(`${this.URL}/change-password`, {
        password,
      })
      .pipe(
        tap(() => {
          this._mustChangePassword.set(false);
        }),
      );
  }

  logout() {
    return this.http.post(`${environment.baseUrl}/auth/logout`, {}, { withCredentials: true });
  }

  updateProfile(password: string) {
    // TODO update user if change another props
    return this.http.patch(`${this.URL}/profile`, { password }).pipe(
      tap(() => {
        const user = this._user();
        if (!user) return;
        this._user.set({ ...user, mustChangePassword: false });
      }),
    );
  }
}
