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
  applications: UserApplicationResponse[];
}

export interface UserApplicationResponse {
  id: number;
  name: string;
  description: string;
}
