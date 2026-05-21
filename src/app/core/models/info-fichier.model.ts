export interface InfoFichier {
  nomFichier: string;
  dateReception: string;
  dateFinTraitement: string;
  statusFichier: 'En cours' | 'OK' | 'KO';
}