import { Client } from './client.model';
import { Etablissement } from './etablissement.model';
import { Historisation } from './historisation.model';
import { Definition, Duree, ResponsableTraitement } from './referentiel.model';

export interface CreateTraitementPayload {
  id: number;
  client: Client;
  // Required — Tab 1
  nom: string;
  dateIdentification?: string;
  etablissements: Array<Etablissement>;
  // Optional — Tab 1 : Identification
  donneesConcernees?: string;
  finalitePrincipale?: Definition | null;
  dateMiseAJour?: string;
  historiqueModifications?: string;
  dataProtectionOfficer?: string;
  responsableTraitement?: ResponsableTraitement | null;
  gestionnaireMiseEnOeuvre?: string;
  sousFinalites?: string;
  // Optional — Tab 2 : Données personnelles
  categoriesPersonnesConcernees?: string;
  donneesIdentification?: string;
  donneesConnexion?: string;
  donneesLocalisation?: string;
  donneesComportementViePerso?: string;
  donneesEconomiquesFinancieres?: string;
  donneesProfessionnelles?: string;
  categoriesParticulieresDonnees?: string;
  sensibilite?: Definition | null;
  etudeImpact?: Definition | null;
  // Optional — Tab 3 : Description
  canauxCollecteDonnees?: string;
  licieteTraitement?: Definition | null;
  recoursTraitementAutomatises?: boolean;
  emplacementPhysique?: string;
  dispositionsSecuriteDonneesPhysique?: string;
  emplacementNumerique?: string;
  dispositionsSecuriteDonneesNumerique?: string;
  hebergement?: string;
  dureeConservation?: Duree | null;
  archivage?: boolean;
  dureeArchivage?: Duree | null;
  categoriesDestinataires?: string;
  raisonsTransfertDestinataires?: string;
  transfertsHorsUE?: boolean;
  paysDestinataires?: string;
  commentaires?: string;
}

/**
 * Vue résumée renvoyée par la liste paginée : le back aplatit la finalité
 * principale sur sa seule valeur textuelle.
 */
export interface Traitement {
  identifiant: string;
  idFonctionnel: number;
  nom: string;
  gestionnaireMiseEnOeuvre: string;
  finalitePrincipale: string;
}

/**
 * Vue détaillée : les champs adossés à un référentiel client (définitions,
 * durées, responsable de traitement) sont renvoyés sous forme d'objet et non
 * plus de chaîne — d'où le type surchargé par rapport à {@link Traitement}.
 */
export interface TraitementDetails extends Omit<Traitement, 'finalitePrincipale'> {
  version: number;
  dateIdentification: Date | string;
  dateMiseAJour: Date | string;
  donneesConcernees: string;
  finalitePrincipale: Definition | null;
  historiqueModifications: string;
  dataProtectionOfficer: string;
  responsableTraitement: ResponsableTraitement | null;
  sousFinalites: string;
  categoriesPersonnesConcernees: string;
  donneesIdentification: string;
  donneesConnexion: string;
  donneesLocalisation: string;
  donneesComportementViePerso: string;
  donneesEconomiquesFinancieres: string;
  donneesProfessionnelles: string;
  categoriesParticulieresDonnees: string;
  sensibilite: Definition | null;
  etudeImpact: Definition | null;
  canauxCollecteDonnees: string;
  licieteTraitement: Definition | null;
  recoursTraitementAutomatises: boolean;
  emplacementPhysique: string;
  dispositionsSecuriteDonneesPhysique: string;
  emplacementNumerique: string;
  dispositionsSecuriteDonneesNumerique: string;
  hebergement: string;
  dureeConservation: Duree | null;
  archivage: boolean;
  dureeArchivage: Duree | null;
  categoriesDestinataires: string;
  raisonsTransfertDestinataires: string;
  transfertsHorsUE: boolean;
  paysDestinataires: string;
  commentaires: string;
  etablissements: Array<Etablissement>;
  historiqueTraitement?: Array<Historisation>;

  // Colonnes complémentaires du registre (RG5)
  impactTraitement?: number | null;
  detournementFinalite?: number | null;
  scoreDetournementFinalite?: number | null;
  collecteDcpInappropriees?: number | null;
  scoreCollecteDcpInappropriees?: number | null;
  conservationExcessiveDcp?: number | null;
  scoreConservationExcessiveDcp?: number | null;
  securisationInsuffisanteDcp?: number | null;
  scoreSecurisationInsuffisanteDcp?: number | null;
  vicesConsentement?: number | null;
  scoreVicesConsentement?: number | null;
  manqueTransparence?: number | null;
  scoreManqueTransparence?: number | null;
  incapaciteExerciceDroits?: number | null;
  scoreIncapaciteExerciceDroits?: number | null;
  transfertTiersMalEncadre?: number | null;
  scoreTransfertTiersMalEncadre?: number | null;
  transfertHorsUeAbusif?: number | null;
  scoreTransfertHorsUeAbusif?: number | null;
  defautPreuve?: number | null;
  scoreDefautPreuve?: number | null;
  scoreGlobal?: number | null;
  commentairesAnalyse?: string | null;
  expositionTraitement?: number | null;
  critereEvaluationScoring?: boolean | null;
  critereDecisionAutomatique?: boolean | null;
  critereSurveillanceSystematique?: boolean | null;
  critereCollecteDonneesSensibles?: boolean | null;
  critereCollecteLargeEchelle?: boolean | null;
  critereCroisementDonnees?: boolean | null;
  criterePersonnesVulnerables?: boolean | null;
  critereUsageInnovant?: boolean | null;
  critereExclusionBeneficeDroit?: boolean | null;
}
