export interface Demande {

  id: string;

  typeDemande: string;

  descriptionSynthetique: string;

  origine: string;

  dateReception: string;

  servicesConcernes: string;

  detailTraitement: string;

  servicesImpliques: string;

  reponse: string;

  alerteRt: string;

  statut: 'EN_ATTENTE' | 'TRAITEE';

  clientId: string;

}

/**
 * Corps attendu par `POST /demandes`.
 *
 * Les champs texte non renseignés sont envoyés vides (`''`) plutôt que `null`,
 * comme le fait déjà le registre : le back les déclare non nuls.
 * `dateReception` est un `LocalDate` au format ISO aaaa-mm-jj, ou `null`.
 */
export interface CreateDemandePayload {

  /** Résolu depuis le groupe Keycloak ; nul si le back n'a pas répondu. */
  clientId: string | number | null;

  typeDemande: string;

  descriptionSynthetique: string;

  origine: string;

  dateReception: string | null;

  servicesConcernes: string;

  detailTraitement: string;

  servicesImpliques: string;

  reponse: string;

  alerteRt: string;

  statut: Demande['statut'];

}
