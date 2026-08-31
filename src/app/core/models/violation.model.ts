/**
 * Client imbriqué dans une violation (`ClientDTO` réduit à son identité).
 * `id` est un UUID : ne pas réutiliser `Client`, dont le modèle le déclare `number`.
 */
export interface ViolationClient {
  id: string;
  nom?: string;
  statut?: string;
}

/** Statuts persistés côté API (`ViolationStatut`). */
export type ViolationStatut = 'EN_COURS' | 'TRAITEE';

/** Propriétés de tri acceptées par `GET /violations` (champs de l'entité Violation). */
export type ViolationSortField =
  | 'dateViolation'
  | 'natureViolation'
  | 'donneesConcernees'
  | 'nombrePersonnesConcernees'
  | 'risqueEleveDroitsLibertes';

/** Vue résumée renvoyée par la liste paginée (`ViolationPartielDTO`). */
export interface Violation {
  identifiant: string;
  /** `LocalDate` sérialisée en `yyyy-MM-dd`. */
  dateViolation?: string;
  natureViolation?: string;
  donneesConcernees?: string;
  nombrePersonnesConcernees?: number;
  risqueEleveDroitsLibertes?: boolean;
  statut?: ViolationStatut;
}

/**
 * Détail complet d'une violation (`ViolationDTO`). Sert aussi de corps au PUT :
 * l'API attend le DTO entier, `client` compris (`@NotNull` côté back).
 */
export interface ViolationDetails extends Violation {
  client?: ViolationClient;
  nombreApproximatifDonneesConcernees?: number;
  categoriesPersonnesConcernees?: string;
  consequences?: string;
  mesuresPrisesPrevues?: string;
  informationCnil?: string;
  communicationPersonnesEffectueeEtDate?: string;
  commentaires?: string;
}

/**
 * Corps du POST `/violations` : identique au détail, sans l'identifiant que
 * l'API génère elle-même.
 */
export type CreateViolationPayload = Omit<ViolationDetails, 'identifiant'>;
