export interface UserResponse {
  id: string;
  login: string;
  fullName: string;
  externalKey: string;
  relationKey: string | null;
  email: string | null;
  isActive: boolean;
  passwordAction: {
    purpose: PasswordActionPurpose;
    expiresAt: string;
  } | null;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
  applications: UserApplicationResponse[];
}

export type UserRole = 'ADMIN' | 'USER';
export type PasswordActionPurpose = 'INITIAL_SETUP' | 'PASSWORD_RESET';

export interface SaveUserRequest {
  fullName: string;
  login: string;
  relationKey: string | null;
  email: string | null;
  roles: UserRole[];
  isActive: boolean;
  applicationIds: number[];
}

export interface CreateUserRequest
  extends Omit<SaveUserRequest, 'fullName' | 'relationKey' | 'email' | 'applicationIds'> {
  relationKey: string;
  email: string;
  applicationIds: string[];
}

export interface EmployeeResponse {
  relationKey: string;
  fullName: string;
  position: string | null;
  unit: string | null;
  area: string | null;
}

export interface EmployeeSearchResponse {
  data: EmployeeResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserApplicationResponse {
  id: number;
  name: string;
  description: string;
}
