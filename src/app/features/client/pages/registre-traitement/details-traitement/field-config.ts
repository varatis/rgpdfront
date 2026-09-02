export type FieldRender =
  | { kind: 'text' }
  | { kind: 'date' }
  | { kind: 'bool' }
  | { kind: 'html'; mode?: 'default' | 'newline' | 'list' }
  | { kind: 'custom'; getter: string };

export interface FieldConfig {
  label: string;
  key: string;
  testIdSuffix: string;
  skeletonWidth: string;
  skeletonLines?: number;
  render: FieldRender;
}

export interface TabConfig {
  name: string;
  fields: FieldConfig[];
}

const text = (label: string, key: string, testId: string, width: string): FieldConfig => ({
  label, key, testIdSuffix: testId, skeletonWidth: width,
  render: { kind: 'text' },
});

const date = (label: string, key: string, testId: string, width: string): FieldConfig => ({
  label, key, testIdSuffix: testId, skeletonWidth: width,
  render: { kind: 'date' },
});

const bool = (label: string, key: string, testId: string, width: string): FieldConfig => ({
  label, key, testIdSuffix: testId, skeletonWidth: width,
  render: { kind: 'bool' },
});

const html = (
  label: string, key: string, testId: string, width: string,
  mode: 'default' | 'newline' | 'list' = 'default',
  lines?: number,
): FieldConfig => ({
  label, key, testIdSuffix: testId, skeletonWidth: width,
  ...(lines ? { skeletonLines: lines } : {}),
  render: { kind: 'html', mode },
});

const custom = (
  label: string, key: string, testId: string, width: string,
  getter: string,
): FieldConfig => ({
  label, key, testIdSuffix: testId, skeletonWidth: width,
  render: { kind: 'custom', getter },
});

export const TAB_IDENTIFICATION: TabConfig = {
  name: 'Identification du traitement',
  fields: [
    text('ID', 'idFonctionnel', 'id', '5%'),
    custom('Etablissement(s)', 'etablissements', 'etablissements', '40%', 'etablissementsDisplay'),
    html('Données concernées', 'donneesConcernees', 'donnees_concernees', '40%'),
    text('Nom du traitement', 'nom', 'nom', '40%'),
    date("Date d'identification du traitement", 'dateIdentification', 'date_identification', '20%'),
    date('Date de mise à jour', 'dateMiseAJour', 'date_maj', '20%'),
    custom('Historique des modifications', 'historiqueTraitement', 'historique', '90%', 'historiqueDisplay'),
    text('Data Protection Officer', 'dataProtectionOfficer', 'dpo', '40%'),
    text('Responsable de traitement', 'responsableTraitement.valeur', 'responsable_traitement', '40%'),
    html('Gestionnaire de la mise en œuvre du traitement', 'gestionnaireMiseEnOeuvre', 'gestionnaire', '40%'),
    text('Finalité principale', 'finalitePrincipale.valeur', 'finalite_principale', '80%'),
    html('Sous-finalités', 'sousFinalites', 'sous_finalites', '80%', 'list'),
  ],
};

export const TAB_DONNEES_PERSO: TabConfig = {
  name: 'Données personnelles traitées',
  fields: [
    html('Catégories de personnes concernées par le traitement',
         'categoriesPersonnesConcernees', 'categories_personnes_concernees', '80%'),
    html("Données d'identification", 'donneesIdentification',
         'donnees_identification', '90%', 'default', 3),
    html('Données de connexion', 'donneesConnexion', 'donnees_connexion', '80%'),
    text('Données de localisation', 'donneesLocalisation', 'donnees_localisation', '80%'),
    html('Données sur le comportement et la vie personnelle',
         'donneesComportementViePerso', 'donnees_comportement', '90%', 'default', 2),
    html('Données économiques et financières',
         'donneesEconomiquesFinancieres', 'donnees_economiques', '80%'),
    text('Données professionnelles', 'donneesProfessionnelles',
         'donnees_professionnelles', '80%'),
    html('Catégories particulières de données (NIR, santé par exemple)',
         'categoriesParticulieresDonnees', 'categories_particulieres', '90%', 'default', 2),
    text('Sensibilité', 'sensibilite.valeur', 'sensibilite', '40%'),
    text("Etude d'impact (PIA)", 'etudeImpact.valeur', 'etude_impact', '90%'),
  ],
};

export const TAB_DESCRIPTION: TabConfig = {
  name: 'Description du traitement',
  fields: [
    html('Canaux de collecte des données', 'canauxCollecteDonnees',
         'canaux_collecte', '80%'),
    text('Licéité du traitement', 'licieteTraitement.valeur', 'liceite', '80%'),
    bool('Recours au traitements automatisés (y compris profilage) ? (Oui / Non)',
     'recoursTraitementAutomatises', 'traitements_automatises', '10%'),
    text('Emplacement physique du traitement', 'emplacementPhysique',
         'emplacement_physique', '60%'),
    html('Dispositions existantes pour assurer la sécurité des données (physique)',
         'dispositionsSecuriteDonneesPhysique', 'dispositions_securite_physique', '90%', 'default', 2),
    text('Emplacement numérique du traitement', 'emplacementNumerique',
         'emplacement_numerique', '20%'),
    html('Dispositions existantes pour assurer la sécurité des données (numérique)',
         'dispositionsSecuriteDonneesNumerique', 'dispositions_securite_numerique', '90%', 'default', 2),
    text('Hébergement', 'hebergement', 'hebergement', '30%'),
    text('Durée de conservation', 'dureeConservation.valeur', 'duree_conservation', '20%'),
    bool('Archivage ? (Oui / Non)', 'archivage', 'archivage', '10%'),
    text("Durée d'archivage", 'dureeArchivage.valeur', 'duree_archivage', '80%'),
    html('Catégories de destinataires', 'categoriesDestinataires',
         'categories_destinataires', '20%'),
    html('Raisons du transfert vers les catégories de destinataires',
         'raisonsTransfertDestinataires', 'raisons_transfert', '80%'),
    bool('Transferts hors UE (Oui / Non)', 'transfertsHorsUE', 'transferts_hors_ue', '10%'),
    html('Pays destinataires', 'paysDestinataires', 'pays_destinataires', '80%'),
    html('Commentaires', 'commentaires', 'commentaires', '80%', 'newline'),
  ],
};

export const TAB_ANALYSE: TabConfig = {
  name: 'Analyse de conformité',
  fields: [],
};

export const ALL_TABS: TabConfig[] = [
  TAB_IDENTIFICATION,
  TAB_DONNEES_PERSO,
  TAB_DESCRIPTION,
  TAB_ANALYSE,
];
