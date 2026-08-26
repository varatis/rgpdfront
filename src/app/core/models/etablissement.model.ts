import { Client } from "./client.model";

export interface Etablissement {
    id?: string | number,
    nom : string,
    client?: Client
}