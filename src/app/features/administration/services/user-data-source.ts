import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../../environments/environment';
import {
  CreateUserRequest,
  EmployeeSearchResponse,
  PasswordActionDelivery,
  SaveUserRequest,
  UserResponse,
} from '../interfaces';

export interface CreateUserResponse {
  user: UserResponse;
  passwordAction: PasswordActionDelivery;
}

export interface PasswordActionResponse {
  message: string;
  passwordAction: PasswordActionDelivery;
}

@Injectable({
  providedIn: 'root',
})
export class UserDataSource {
  private readonly http = inject(HttpClient);
  readonly URL = `${environment.identityHubUrl}/api/users`;

  findAll(limit: number, offset: number, term?: string) {
    const params = new HttpParams({
      fromObject: { limit, offset, ...(term && { term }) },
    });
    return this.http.get<{ users: UserResponse[]; total: number }>(this.URL, { params });
  }

  searchEmployees(q: string) {
    const params = new HttpParams({ fromObject: { q, page: 1, limit: 10 } });
    return this.http.get<EmployeeSearchResponse>(`${this.URL}/employees`, { params });
  }

  create(request: CreateUserRequest) {
    return this.http.post<CreateUserResponse>(`${this.URL}/access`, request);
  }

  update(id: string, request: SaveUserRequest) {
    return this.http.patch<{ user: UserResponse }>(`${this.URL}/${id}`, request);
  }

  resetPassword(id: string) {
    return this.http.post<PasswordActionResponse>(`${this.URL}/${id}/password-reset`, {});
  }

  resendPasswordAction(id: string) {
    return this.http.post<PasswordActionResponse>(`${this.URL}/${id}/password-action/resend`, {});
  }
}
