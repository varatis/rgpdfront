/**
 * Valeurs de référence désormais partagées au niveau du client :
 * le back ne renvoie plus une simple chaîne mais l'entité qui la porte.
 *
 * Le client n'y figure pas : il est déjà porté par l'objet englobant en
 * lecture, et déduit du traitement en écriture.
 */

/** Types de définition portés par le discriminateur côté back. */
export const TYPE_FINALITE_PRINCIPALE = 'Finalité Principale';
export const TYPE_SENSIBILITE = 'Sensibilité';
export const TYPE_ETUDE_IMPACT = 'Etude impact';
export const TYPE_LICEITE_TRAITEMENT = 'Liceité Traitement';

export interface Definition {
    id?: number;
    type?: string;
    valeur: string;
}

/** `estArchivage` distingue la durée de conservation de la durée d'archivage. */
export const DUREE_CONSERVATION = false;
export const DUREE_ARCHIVAGE = true;

export interface Duree {
    id?: number;
    estArchivage?: boolean;
    valeur: string;
}

export interface ResponsableTraitement {
    id?: number;
    valeur: string;
    informationsComplementaires?: string;
}
