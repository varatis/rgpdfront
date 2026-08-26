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
