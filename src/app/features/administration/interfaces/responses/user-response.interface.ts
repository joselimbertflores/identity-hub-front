import { ApplicationResponse } from './application-response.interface';

export interface UserResponse {
  id: string;
  login: string;
  password: string;
  fullName: string;
  externalKey: string;
  relationKey: string;
  email: null;
  isActive: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
  applications: ApplicationResponse[];
}
