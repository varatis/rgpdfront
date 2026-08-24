import type { Definition, Duree, ResponsableTraitement } from "./referentiel.model";

export interface Client {
    id : number,
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
