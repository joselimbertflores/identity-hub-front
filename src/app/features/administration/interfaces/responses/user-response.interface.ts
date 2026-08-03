export interface UserResponse {
  id: string;
  login: string;
  fullName: string;
  externalKey: string;
  relationKey: string | null;
  email: string | null;
  isActive: boolean;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
  applications: UserApplicationResponse[];
}

export type UserRole = 'ADMIN' | 'USER';

export interface SaveUserRequest {
  fullName: string;
  login: string;
  relationKey: string | null;
  email: string | null;
  roles: UserRole[];
  isActive: boolean;
  applicationIds: number[];
}

export interface UserApplicationResponse {
  id: number;
  name: string;
  description: string;
}
