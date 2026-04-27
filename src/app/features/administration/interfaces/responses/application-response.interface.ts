export interface ApplicationResponse {
  id: number;
  clientId: string;
  name: string;
  description: string;
  launchUrl: string;
  clientSecret: string;
  isConfidential: boolean;
  isActive: boolean;
  createdAt: string;
}
