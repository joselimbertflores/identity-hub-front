export interface ApplicationResponse {
  id: number;
  clientId: string;
  name: string;
  description: string;
  launchUrl: string;
  backchannelLogoutUri: string | null;
  isConfidential: boolean;
  isActive: boolean;
  createdAt: string;
}
