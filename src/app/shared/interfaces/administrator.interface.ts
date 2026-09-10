export type AdministratorRole = 'super-admin' | 'admin' | 'user';

export interface Administrator {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  clientId?: string | null;
  clientNom?: string | null;
  roles: AdministratorRole[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
}

export interface UtilisateurApi {
  id: string;
  identifiant: string;
  prenom: string;
  nom: string;
  email: string;
  actif: boolean;
  roles: string[];
  clientId: string | null;
  clientNom: string | null;
}

export interface AdministratorCreatePayload {
  nom: string;
  prenom: string;
  email: string;
  roles: AdministratorRole[];
  clientId: string;
  actif: boolean;
}

export interface AdministratorUpdatePayload {
  nom: string;
  prenom: string;
  email: string;
  roles: AdministratorRole[];
  clientId?: string | null;
  actif: boolean;
}

export function utilisateurToAdministrator(dto: UtilisateurApi): Administrator {
  return {
    id: dto.id,
    nom: dto.nom ?? '',
    prenom: dto.prenom ?? '',
    email: dto.email ?? '',
    clientId: dto.clientId ?? null,
    clientNom: dto.clientNom ?? null,
    roles: (dto.roles ?? []).filter((role): role is AdministratorRole =>
      role === 'admin' || role === 'user' || role === 'super-admin'
    ),
    isActive: dto.actif ?? true
  };
}

export function administratorToUpdatePayload(
  admin: Administrator,
  patch?: Partial<Pick<Administrator, 'nom' | 'prenom' | 'email' | 'roles'>>
): AdministratorUpdatePayload {
  return {
    nom: patch?.nom ?? admin.nom,
    prenom: patch?.prenom ?? admin.prenom,
    email: patch?.email ?? admin.email,
    roles: [...(patch?.roles ?? admin.roles)],
    clientId: admin.clientId ?? null,
    actif: admin.isActive
  };
}
