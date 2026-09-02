export interface ImportApercu {
  nomFichier?: string | null;
  clientNom?: string | null;
  fichierValide: boolean;
  messageErreur?: string | null;
  versionActuelle?: string | null;
  dateVersionActuelle?: string | null;
  versionFichier?: string | null;
  remplacementDonnees: boolean;
  nombreTraitementsExistants?: number | null;
  nombrePreconisationsExistantes?: number | null;
  nombreViolationsExistantes?: number | null;
  avertissement?: string | null;
  urlExportPrealable?: string | null;
}

export interface InfoFichier {
  nomFichier: string;
  dateReception?: string;
  dateFinTraitement?: string;
  statusFichier: string;
  confirmationRequise?: boolean;
  apercu?: ImportApercu | null;
  version?: string | null;
  nombreTraitementsRemplaces?: number | null;
  nombreTraitementsImportes?: number | null;
}
