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
