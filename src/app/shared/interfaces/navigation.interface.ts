export interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles: UserRole[];
}

export type UserRole = 'admin' | 'client' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  clientLogo?: string;
  clientName?: string;
}