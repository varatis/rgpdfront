import { Client } from "./client.model";
import { Etablissement } from "./etablissement.model";
import { Definition, Duree, ResponsableTraitement } from "./referentiel.model";

export interface CreateTraitementPayload {
    id: number;
    client : Client;
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
    motifModification?: string;
}

/**
 * Vue résumée renvoyée par la liste paginée : le back aplatit la finalité
 * principale sur sa seule valeur textuelle.
 */
export interface Traitement {
    identifiant: string,
    idFonctionnel: number,
    nom: string,
    gestionnaireMiseEnOeuvre: string,
    finalitePrincipale: string
}

/**
 * Vue détaillée : les champs adossés à un référentiel client (définitions,
 * durées, responsable de traitement) sont renvoyés sous forme d'objet et non
 * plus de chaîne — d'où le type surchargé par rapport à {@link Traitement}.
 */
export interface TraitementDetails extends Omit<Traitement, 'finalitePrincipale'> {
    version: number
    dateIdentification: Date,
    dateMiseAJour: Date,
    donneesConcernees: string,
    finalitePrincipale: Definition | null,
    historiqueModifications: string,
    dataProtectionOfficer: string,
    responsableTraitement: ResponsableTraitement | null,
    sousFinalites: string,
    categoriesPersonnesConcernees: string,
    donneesIdentification: string,
    donneesConnexion: string,
    donneesLocalisation: string,
    donneesComportementViePerso: string,
    donneesEconomiquesFinancieres: string,
    donneesProfessionnelles: string,
    categoriesParticulieresDonnees: string,
    sensibilite: Definition | null,
    etudeImpact: Definition | null,
    canauxCollecteDonnees: string,
    licieteTraitement: Definition | null,
    recoursTraitementAutomatises: boolean,
    emplacementPhysique: string,
    dispositionsSecuriteDonneesPhysique: string,
    emplacementNumerique: string,
    dispositionsSecuriteDonneesNumerique: string,
    hebergement: string,
    dureeConservation: Duree | null,
    archivage: boolean,
    dureeArchivage: Duree | null,
    categoriesDestinataires: string,
    raisonsTransfertDestinataires: string,
    transfertsHorsUE: boolean,
    paysDestinataires: string,
    commentaires: string,
    etablissements: Array<Etablissement>
}
