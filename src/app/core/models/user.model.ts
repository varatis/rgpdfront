export interface User {
  id: number | string;
  nom: string;
  prenom: string;
  email: string;
  role?: 'superadmin' | 'admin' | 'client';
  fonction?: string;
  isActive?: boolean;
  createdAt?: Date;
  lastLogin?: Date;
}
