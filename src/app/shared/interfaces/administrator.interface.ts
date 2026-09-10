export type AdministratorRole = 'super-admin' | 'admin' | 'user';

export interface Administrator {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  identifiant?: string;
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
  groupe: string;
  actif: boolean;
  motDePasse: string;
}

export interface AdministratorUpdatePayload {
  nom: string;
  prenom: string;
  email: string;
  roles: AdministratorRole[];
  clientId?: string | null;
  groupe?: string | null;
  actif: boolean;
  motDePasse?: string | null;
}

export interface AdministratorUpdatePatch {
  nom?: string;
  prenom?: string;
  email?: string;
  roles?: AdministratorRole[];
  motDePasse?: string | null;
}

export function utilisateurToAdministrator(dto: UtilisateurApi): Administrator {
  return {
    id: dto.id,
    nom: dto.nom ?? '',
    prenom: dto.prenom ?? '',
    email: dto.email ?? '',
    identifiant: dto.identifiant ?? '',
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
  patch?: AdministratorUpdatePatch
): AdministratorUpdatePayload {
  return {
    nom: patch?.nom ?? admin.nom,
    prenom: patch?.prenom ?? admin.prenom,
    email: patch?.email ?? admin.email,
    roles: [...(patch?.roles ?? admin.roles)],
    clientId: admin.clientId ?? null,
    groupe: admin.clientNom ?? null,
    actif: admin.isActive,
    motDePasse: patch?.motDePasse ?? null
  };
}
