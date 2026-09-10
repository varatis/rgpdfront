export interface FiltreAdministrateurPayload {
  nom: string;
  prenom: string;
  client: string;
}

export const FILTRE_ADMINISTRATEUR_VIDE: FiltreAdministrateurPayload = {
  nom: '',
  prenom: '',
  client: ''
};
