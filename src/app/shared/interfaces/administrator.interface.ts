export type AdministratorRole = 'super-admin' | 'admin' | 'user';

export interface Administrator {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  clientNom?: string | null;
  roles: AdministratorRole[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

export interface AdministratorCreatePayload {
  nom: string;
  prenom: string;
  email: string;
  clientNom: string;
  roles: AdministratorRole[];
}

export interface AdministratorUpdatePayload {
  nom?: string;
  prenom?: string;
  email?: string;
  clientNom?: string | null;
  roles?: AdministratorRole[];
}
