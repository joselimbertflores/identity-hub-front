export interface AuthUserResponse {
  id: string;
  login: string;
  fullName: string;
  roles: string[];
  mustChangePassword: boolean;
}
