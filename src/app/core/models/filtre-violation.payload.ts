export interface FiltreViolationPayload {
  natureViolation: string;
  donneesConcernees: string;
  /** `null` = pas de filtre : le back distingue `true`, `false` et l'absence de critère. */
  risqueEleveDroitsLibertes: boolean | null;
  /** `yyyy-MM-dd` — valeur brute d'un `<input type="date">`, borne incluse. */
  dateViolationDebut: string;
  /** `yyyy-MM-dd` — borne incluse. */
  dateViolationFin: string;
  /** Bornes incluses ; `null` = borne non renseignée. */
  nombrePersonnesConcerneesMin: number | null;
  nombrePersonnesConcerneesMax: number | null;
}

/** Aucun critère : état initial du panneau de filtres et cible du bouton « Réinitialiser ». */
export const FILTRE_VIOLATION_VIDE: FiltreViolationPayload = {
  natureViolation: '',
  donneesConcernees: '',
  risqueEleveDroitsLibertes: null,
  dateViolationDebut: '',
  dateViolationFin: '',
  nombrePersonnesConcerneesMin: null,
  nombrePersonnesConcerneesMax: null
};
