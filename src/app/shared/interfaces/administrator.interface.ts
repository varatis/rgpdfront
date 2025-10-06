export interface Administrator {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'super-admin' | 'admin' | 'user';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}