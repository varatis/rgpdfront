/**
 * Critères du panneau de filtres de la liste des clients. Le statut n'y figure
 * pas : les onglets « Actuel » / « Archivé » partitionnent déjà la liste par
 * `statut`, les filtres ne portent que sur la population de l'onglet affiché.
 *
 * Le filtrage est appliqué côté front : `GET /clients` renvoie la liste
 * complète, sans pagination ni paramètre de recherche.
 */
export interface FiltreClientPayload {
  /** Recherche insensible à la casse et aux accents, sur une partie du nom. */
  nom: string;
  /** Recherche insensible à la casse, sur une partie de la version. */
  version: string;
  /** `yyyy-MM-dd` — borne incluse sur `dateVersion`. */
  dateVersionDebut: string;
  /** `yyyy-MM-dd` — borne incluse sur `dateVersion`. */
  dateVersionFin: string;
}

/** Aucun critère : état initial du panneau et cible du bouton « Réinitialiser ». */
export const FILTRE_CLIENT_VIDE: FiltreClientPayload = {
  nom: '',
  version: '',
  dateVersionDebut: '',
  dateVersionFin: ''
};
