export interface AuthUserResponse {
  id: string;
  login: string;
  fullName: string;
  roles: string[];
  mustChangePassword: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  passwordConfirmation: string;
}

export interface ChangePasswordResponse {
  message: string;
  redirectUrl: string;
}

export interface ForgotPasswordRequest {
  identifier: string;
}

export interface CompletePasswordActionRequest {
  code: string;
  newPassword: string;
  passwordConfirmation: string;
}

export interface MessageResponse {
  message: string;
}
