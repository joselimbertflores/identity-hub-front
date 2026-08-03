export interface PasswordActionManualDetails {
  code: string;
  actionUrl: string;
  expiresAt: string;
}

export type PasswordActionDelivery =
  | {
      method: 'EMAIL';
      status: 'SENT';
      expiresAt: string;
    }
  | ({ method: 'MANUAL' } & PasswordActionManualDetails)
  | {
      method: 'EMAIL';
      status: 'FAILED';
      expiresAt: string;
      fallback: Omit<PasswordActionManualDetails, 'expiresAt'>;
    };
