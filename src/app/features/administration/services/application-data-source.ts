import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { ApplicationResponse } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class ApplicationDataSource {
  readonly URL = `${environment.baseUrl}/applications`;
  private http = inject(HttpClient);

  constructor() {}

  create(form: object) {
    return this.http.post<{ application: any; clientSecret: string }>(this.URL, form);
  }

  update(id: number, form: object) {
    return this.http.patch(`${this.URL}/${id}`, form);
  }

  findAll(limit: number, offset: number, term?: string) {
    const params = new HttpParams({
      fromObject: { limit, offset, ...(term && { term }) },
    });
    return this.http.get<{ clients: ApplicationResponse[]; total: number }>(this.URL, {
      params,
    });
  }

  regenerateSecret(id: number) {
    return this.http.post<{ clientSecret: string }>(`${this.URL}/${id}/regenerate-secret`, {});
  }

  getFormOptions() {
    return this.http.get<{ id: number; name: string; description: string }[]>(
      `${this.URL}/options`,
    );
  }
}
