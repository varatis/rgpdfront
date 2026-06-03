export interface CreateTraitementPayload {
    // Required — Tab 1
    nom: string;
    gestionnaire: string;
    finalitePrincipale: string;
    // Optional — Tab 1 : Identification
    dateIdentification?: string;
    dateMiseAJour?: string;
    historiqueModifications?: string;
    dataProtectionOfficer?: string;
    responsableTraitement?: string;
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
    sensibilite?: string;
    etudeImpact?: string;
    // Optional — Tab 3 : Description
    canauxCollecteDonnees?: string;
    licieteTraitement?: string;
    recoursTraitementAutomatises?: boolean;
    emplacementPhysique?: string;
    dispositionsSecuriteDonnees?: string;
    emplacementNumerique?: string;
    hebergement?: string;
    dureeConservation?: number | null;
    archivage?: boolean;
    dureeArchivage?: number | null;
    categoriesDestinataires?: string;
    raisonsTransfertDestinataires?: string;
    transfertsHorsUE?: boolean;
    paysDestinataires?: string;
    commentaires?: string;
}

export interface Traitement {
    idFonctionnel: number,
    nom: string,
    gestionnaire: string,
    finalitePrincipale: string
}

export interface TraitementDetails extends Traitement {
    version: number
    dateIdentification: Date,
    dateMiseAJour: Date,
    historiqueModifications: string,
    dataProtectionOfficer: string,
    responsableTraitement: string,
    gestionnaireMiseEnOeuvre: string,
    sousFinalites: string,
    categoriesPersonnesConcernees: string,
    donneesIdentification: string,
    donneesConnexion: string,
    donneesLocalisation: string,
    donneesComportementViePerso: string,
    donneesEconomiquesFinancieres: string,
    donneesProfessionnelles: string,
    categoriesParticulieresDonnees: string,
    sensibilite: string,
    etudeImpact: string,
    canauxCollecteDonnees: string,
    licieteTraitement: string,
    recoursTraitementAutomatises: boolean,
    emplacementPhysique: string,
    dispositionsSecuriteDonnees: string,
    emplacementNumerique: string,
    hebergement: string,
    dureeConservation: number,
    archivage: boolean,
    dureeArchivage: number,
    categoriesDestinataires: string,
    raisonsTransfertDestinataires: string,
    transfertsHorsUE: boolean,
    paysDestinataires: string,
    commentaires: string,
    etablissements: Array<Etablissement>
}