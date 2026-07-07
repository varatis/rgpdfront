export interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles: UserRole[];
}

export type UserRole = 'superadmin' | 'admin' | 'client';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  clientLogo?: string;
  clientName?: string;
}
