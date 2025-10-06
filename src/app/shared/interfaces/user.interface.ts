export interface User {
  id: string;
  nom: string;
  prenom: string;
  fonction: string;
  email: string;
  isActive?: boolean;
  createdAt?: Date;
}