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
    commentaires: string
}