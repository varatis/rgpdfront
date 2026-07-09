import { Client } from "./client.model";

export interface Etablissement {
    id?: number,
    nom : string,
    client?: Client
}