export interface User {
  id: number | string;
  nom: string;
  prenom: string;
  email: string;
  role?: 'super-admin' | 'admin' | 'user' | 'client';
  fonction?: string;
  isActive?: boolean;
  createdAt?: Date;
  lastLogin?: Date;
}
