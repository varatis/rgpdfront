export interface Preconisation {
  id: string;
  titre: string;
  priorite: 'Urgent' | 'Très urgent';
  complexite: 'Très simple' | 'Moyennement complexe' | 'Complexe';
}