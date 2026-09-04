import type { Definition, Duree, ResponsableTraitement } from "./referentiel.model";

export interface Client {
    // Les clients du back sont identifiés par un UUID. Le type number est
    // conservé pour les anciennes réponses encore utilisées par le registre.
    id : string | number,
    nom : string,
    statut : string,
    version? : string,
    dateVersion? : string,
    // Renseignés uniquement par les endpoints /clients ; nuls quand le client
    // est imbriqué dans un traitement ou un établissement.
    durees? : Array<Duree>,
    definitions? : Array<Definition>,
    responsablesTraitement? : Array<ResponsableTraitement>
}

/**
 * Statuts d'un client. La colonne `statut` est un VARCHAR libre côté base, sans
 * énumération : ces deux valeurs sont la convention retenue par le front pour
 * alimenter les onglets « Actuel » / « Archivé ». À aligner si l'API vient à
 * typer la colonne.
 */
export const STATUT_CLIENT_ACTIF = 'ACTIF';
export const STATUT_CLIENT_ARCHIVE = 'ARCHIVE';

/**
 * Corps des appels `POST /clients` et `PUT /clients/{id}`. Ne porte que les
 * colonnes scalaires : les référentiels (durées, définitions, responsables de
 * traitement) sont alimentés par le domaine et refusés en écriture.
 */
export interface ClientWritePayload {
    nom : string,
    statut? : string | null,
    version? : string | null,
    /** Date ISO (`yyyy-MM-dd`), telle qu'attendue par le `LocalDate` du back. */
    dateVersion? : string | null
}
