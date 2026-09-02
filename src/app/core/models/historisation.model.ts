export interface Historisation {
  id?: number | null;
  date?: string | null;
  motif?: string | null;
  auteur?: string | null;
}

export interface HistorisationCreationPayload {
  motif: string;
  date?: string | null;
}
