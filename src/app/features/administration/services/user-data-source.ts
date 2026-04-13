import { HttpClient, HttpParams } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { inject, Injectable } from '@angular/core';

import { map, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApplicationResponse, UserResponse } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class UserDataSource {
  private http = inject(HttpClient);
  readonly URL = environment.baseUrl;

  readonly applications = toSignal(
    this.http.get<ApplicationResponse[]>(`${this.URL}/access/applications`),
    {
      initialValue: [],
    },
  );

  create(form: object) {
    return this.http.post<{ user: UserResponse; credentialsPdfBase64: string }>(
      `${this.URL}/access`,
      form,
    );
  }

  update(id: string, form: object) {
    return this.http.put<UserResponse>(`${this.URL}/access/${id}`, form);
  }

  resetCredentials(id: string) {
    return this.http
      .post<{
        credentialsPdfBase64: string;
        message: string;
      }>(`${this.URL}/users/${id}/reset-credentials`, {})
      .pipe(
        tap((resp) => this.showPdfFromBase64(resp.credentialsPdfBase64)),
        map((resp) => ({
          message: resp.message,
        })),
      );
  }

  findAll(limit: number, offset: number, term?: string) {
    const params = new HttpParams({
      fromObject: { limit, offset, ...(term && { term }) },
    });
    return this.http
      .get<{ users: any[]; total: number }>(`${this.URL}/users`, {
        params,
      })
      .pipe(
        tap((resp) => {
          console.log(resp);
        }),
      );
  }

  showPdfFromBase64(base64: string): void {
    const byteCharacters = atob(base64);
    const byteNumbers = Array.from(byteCharacters).map((c) => c.charCodeAt(0));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  }
}
