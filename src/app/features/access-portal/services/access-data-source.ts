import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { AssginedAppsResponse } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class AccessDataSource {
  private readonly URL = `${environment.identityHubUrl}/api/access-portal`;
  private http = inject(HttpClient);

  getMyApplications() {
    return this.http.get<AssginedAppsResponse[]>(`${this.URL}/my-applications`);
  }
}
