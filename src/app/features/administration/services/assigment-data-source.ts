import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApplicationResponse } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class AssigmentDataSource {
  readonly URL = `${environment.identityHubUrl}/api/assigment`;
  private http = inject(HttpClient);

  applications = toSignal(this.http.get<ApplicationResponse[]>(`${this.URL}/applications`), {
    initialValue: [],
  });

  create(form: object) {
    return this.http.post(this.URL, form);
  }

 
}
