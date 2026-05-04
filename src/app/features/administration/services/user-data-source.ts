import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { map, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { UserResponse } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class UserDataSource {
  private http = inject(HttpClient);
  readonly URL = `${environment.identityHubUrl}/api/users`;

  findAll(limit: number, offset: number, term?: string) {
    const params = new HttpParams({
      fromObject: { limit, offset, ...(term && { term }) },
    });
    return this.http.get<{ users: UserResponse[]; total: number }>(this.URL, {
      params,
    });
  }

  create(form: object) {
    return this.http.post<{ user: UserResponse; credentialsPdfBase64: string }>(
      `${this.URL}/access`,
      form,
    );
  }

  update(id: string, form: object) {
    return this.http.patch<{ user: UserResponse }>(`${this.URL}/${id}`, form);
  }

  resetCredentials(id: string) {
    return this.http
      .post<{
        credentialsPdfBase64: string;
        message: string;
      }>(`${this.URL}/${id}/reset-credentials`, {})
      .pipe(
        tap((resp) => this.showPdfFromBase64(resp.credentialsPdfBase64)),
        map((resp) => ({
          message: resp.message,
        })),
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
