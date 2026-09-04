/**
 * Métadonnées du logo d'un client, renvoyées par `/clients/{id}/logo/info`
 * sans le contenu binaire.
 */
export interface ClientLogoInfo {
    /**
     * Nom fourni par le navigateur au dépôt. Donnée non fiable : à afficher
     * comme du texte, jamais à réinjecter dans une URL ou un nom de fichier.
     */
    nomFichier: string,
    /** Taille en octets. */
    taille: number,
    /** Type réellement détecté côté serveur, pas celui annoncé au dépôt. */
    contentType: string,
    /** Empreinte SHA-256 du contenu, sans guillemets (l'en-tête HTTP, lui, en a). */
    etag: string
}
