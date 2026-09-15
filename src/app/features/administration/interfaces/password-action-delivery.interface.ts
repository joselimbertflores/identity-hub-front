export interface PasswordActionDelivery {
  method: 'EMAIL';
  status: 'SENT' | 'FAILED';
  expiresAt: string;
}
