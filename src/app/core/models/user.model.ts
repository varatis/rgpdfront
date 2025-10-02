export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: 'admin' | 'user';
  token?: string;
}