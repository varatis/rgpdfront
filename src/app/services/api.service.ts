import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ImportApercu, InfoFichier } from '../core/models/info-fichier.model';
import { Historisation, HistorisationCreationPayload } from '../core/models/historisation.model';
import { CreateTraitementPayload, Traitement, TraitementDetails } from '../core/models/traitement.model';
import { PageResponse } from '../core/models/page-response.model';
import { Etablissement } from '../core/models/etablissement.model';
import { Client, ClientWritePayload } from '../core/models/client.model';
import { ClientLogoInfo } from '../core/models/client-logo.model';
import { FiltreTraitementPayload } from '../core/models/filtre-traitement.payload';
import { FiltrePreconisationPayload } from '../core/models/filtre-preconisation.payload';
import {
  Preconisation,
  PreconisationDetails,
  PreconisationWritePayload
} from '../core/models/preconisation.model';
import { CreateDemandePayload, Demande } from '../core/models/demande.model';
import {
  CreateViolationPayload,
  Violation,
  ViolationDetails,
  ViolationSortField,
  ViolationStatut
} from '../core/models/violation.model';
import { FiltreViolationPayload } from '../core/models/filtre-violation.payload';
import {
  Administrator,
  AdministratorCreatePayload,
  AdministratorUpdatePayload
} from '../shared/interfaces/administrator.interface';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiURL;

  /**
   * Colonnes de la liste dont la propriété persistée n'est plus une chaîne :
   * le tri doit porter sur la valeur textuelle de l'entité référencée.
   */
  private static readonly SORT_PROPERTIES: Record<string, string> = {
    finalitePrincipale: 'finalitePrincipale.valeur',
  };


  constructor(private http: HttpClient) { }

  uploadRgpdFile(file: File, confirmerRemplacement = false): Observable<InfoFichier> {
    const formData = new FormData();
    formData.append('file', file);

    const params = new HttpParams().set('confirmerRemplacement', confirmerRemplacement);

    return this.http.post<InfoFichier>(this.apiUrl + 'importFichierRgpd', formData, { params });
  }

  getImportApercu(nomFichier: string): Observable<ImportApercu> {
    const params = new HttpParams().set('nomFichier', nomFichier);

    return this.http.get<ImportApercu>(this.apiUrl + 'importFichierRgpd/apercu', { params });
  }


  getTraitements(page: number, size: number, sortField: string = 'id',
      sortDirection: 'asc' | 'desc' = 'asc', clientNom?: string, filters?: Partial<FiltreTraitementPayload>): Observable<PageResponse<Traitement>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', `${ApiService.SORT_PROPERTIES[sortField] ?? sortField},${sortDirection}`);

    if (clientNom) {
      params = params.set('clientNom', clientNom);
    }

    if (filters?.traitement) {
      params = params.set('nom', filters.traitement);
    }
    if (filters?.gestionnaire) {
      params = params.set('gestionnaireMiseEnOeuvre', filters.gestionnaire);
    }
    if (filters?.finalitePrincipale) {
      params = params.set('finalitePrincipale', filters.finalitePrincipale);
    }

    return this.http.get<PageResponse<Traitement>>(
      this.apiUrl + "traitements",
      { params }
    );
  }

  getTraitementDetails(traitementId: number | undefined): Observable<TraitementDetails> {
    return this.http.get<TraitementDetails>(
      this.apiUrl + "traitements/" + traitementId);
  }

  createTraitement(payload: CreateTraitementPayload): Observable<Traitement> {
    return this.http.post<Traitement>(this.apiUrl + "traitements", payload);
  }

  getDemandes(): Observable<Demande[]> {
    return this.http.get<Demande[]>(
      this.apiUrl + 'demandes'
    );
  }

  createDemande(payload: CreateDemandePayload): Observable<Demande> {
    return this.http.post<Demande>(
      this.apiUrl + 'demandes',
      payload
    );
  }

  updateTraitement(id: number, payload: CreateTraitementPayload): Observable<TraitementDetails> {
    return this.http.put<TraitementDetails>(this.apiUrl + "traitements/" + id, payload);
  }

  addTraitementHistorique(id: number, payload: HistorisationCreationPayload): Observable<Historisation> {
    return this.http.post<Historisation>(this.apiUrl + 'traitements/' + id + '/historique', payload);
  }

  deleteTraitement(id: string): Observable<void> {
    return this.http.delete<void>(this.apiUrl + "traitements/" + id);
  }

  getNextTraitementId(): Observable<Number> {
    return this.http.get<Number>(this.apiUrl + "traitements/nextId");
  }

  getEtablissements(clientId: string | number): Observable<Etablissement[]> {
    const params = new HttpParams().set('clientId', clientId);

    return this.http.get<Etablissement[]>(this.apiUrl + "etablissements", { params });
  }

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl + "clients");
  }

  getClientByNom(nom: string): Observable<Client> {
    return this.http.get<Client>(this.apiUrl + "clients/nom/" + encodeURIComponent(nom));
  }

  createClient(payload: ClientWritePayload): Observable<Client> {
    return this.http.post<Client>(this.apiUrl + "clients", payload);
  }

  updateClient(clientId: string, payload: ClientWritePayload): Observable<Client> {
    return this.http.put<Client>(this.apiUrl + "clients/" + clientId, payload);
  }

  deleteClient(clientId: string): Observable<void> {
    return this.http.delete<void>(this.apiUrl + "clients/" + clientId);
  }

  /**
   * Contenu binaire du logo. L'endpoint exige un JWT comme le reste de l'API :
   * une balise `<img src>` partirait anonyme et recevrait un 401. Le blob est
   * donc rapatrié via l'intercepteur, puis converti en URL d'objet par l'appelant.
   * Un client sans logo répond 404 : c'est l'état nominal, pas une erreur.
   *
   * Le paramètre `_` n'est pas lu par le back : il ne sert qu'à rendre l'URL
   * différente à chaque chargement. Sans lui, le navigateur ressert l'image
   * qu'il a en cache après un remplacement fait depuis une autre session : un
   * PUT n'invalide l'entrée de cache que dans le navigateur qui l'a émis, celui
   * qui a déposé le logo voit donc le nouveau, tous les autres l'ancien.
   */
  getClientLogo(clientId: string): Observable<Blob> {
    return this.http.get(this.apiUrl + "clients/" + clientId + "/logo", {
      responseType: 'blob',
      params: new HttpParams().set('_', Date.now())
    });
  }

  /** Nom, taille et type du logo, sans transférer l'image. */
  getClientLogoInfo(clientId: string): Observable<ClientLogoInfo> {
    return this.http.get<ClientLogoInfo>(this.apiUrl + "clients/" + clientId + "/logo/info");
  }

  /**
   * Dépose ou remplace le logo (PNG, JPEG ou WebP, 1 Mo maximum ; le SVG est
   * refusé). Le même appel crée et remplace : il n'y a pas de POST distinct.
   */
  uploadClientLogo(clientId: string, file: File): Observable<ClientLogoInfo> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.put<ClientLogoInfo>(this.apiUrl + "clients/" + clientId + "/logo", formData);
  }

  deleteClientLogo(clientId: string): Observable<void> {
    return this.http.delete<void>(this.apiUrl + "clients/" + clientId + "/logo");
  }

  getAdministrators(): Observable<Administrator[]> {
    return this.http.get<Administrator[]>(this.apiUrl + "administrateurs");
  }

  createAdministrator(payload: AdministratorCreatePayload): Observable<Administrator> {
    return this.http.post<Administrator>(this.apiUrl + "administrateurs", payload);
  }

  updateAdministrator(id: string, payload: AdministratorUpdatePayload): Observable<Administrator> {
    return this.http.put<Administrator>(this.apiUrl + "administrateurs/" + id, payload);
  }

  deleteAdministrator(id: string): Observable<void> {
    return this.http.delete<void>(this.apiUrl + "administrateurs/" + id);
  }

  getPreconisations(
    page: number,
    size: number,
    sortField: string = 'libelle',
    sortDirection: 'asc' | 'desc' = 'asc',
    clientNom?: string,
    filters?: Partial<FiltrePreconisationPayload>
  ): Observable<PageResponse<Preconisation>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', `${sortField},${sortDirection}`);

    if (clientNom) {
      params = params.set('clientNom', clientNom);
    }
    if (filters?.libelle) {
      params = params.set('libelle', filters.libelle);
    }

    return this.http.get<PageResponse<Preconisation>>(
      this.apiUrl + 'preconisations',
      { params }
    );
  }

  getPreconisationDetails(identifiant: string): Observable<PreconisationDetails> {
    return this.http.get<PreconisationDetails>(this.apiUrl + 'preconisations/' + identifiant);
  }

  traiterDemande(id: string): Observable<any> {

    return this.http.put(
      this.apiUrl + 'demandes/' + id + '/traiter',
      {}
    );
  }

  createPreconisation(payload: PreconisationWritePayload): Observable<PreconisationDetails> {
    return this.http.post<PreconisationDetails>(this.apiUrl + 'preconisations', payload);
  }

  updatePreconisation(
    identifiant: string,
    payload: PreconisationWritePayload
  ): Observable<PreconisationDetails> {
    return this.http.put<PreconisationDetails>(
      this.apiUrl + 'preconisations/' + identifiant,
      payload
    );
  }

  deletePreconisation(identifiant: string): Observable<void> {
    return this.http.delete<void>(this.apiUrl + 'preconisations/' + identifiant);
  }

  getViolations(
    page: number,
    size: number,
    sortField: ViolationSortField = 'dateViolation',
    sortDirection: 'asc' | 'desc' = 'desc',
    clientNom?: string,
    statut?: ViolationStatut,
    filters?: Partial<FiltreViolationPayload>
  ): Observable<PageResponse<Violation>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', `${sortField},${sortDirection}`);

    if (clientNom) {
      params = params.set('clientNom', clientNom);
    }
    if (statut) {
      params = params.set('statut', statut);
    }
    if (filters?.natureViolation) {
      params = params.set('natureViolation', filters.natureViolation);
    }
    if (filters?.donneesConcernees) {
      params = params.set('donneesConcernees', filters.donneesConcernees);
    }
    if (filters?.risqueEleveDroitsLibertes != null) {
      params = params.set('risqueEleveDroitsLibertes', filters.risqueEleveDroitsLibertes);
    }
    if (filters?.dateViolationDebut) {
      params = params.set('dateViolationDebut', filters.dateViolationDebut);
    }
    if (filters?.dateViolationFin) {
      params = params.set('dateViolationFin', filters.dateViolationFin);
    }
    if (filters?.nombrePersonnesConcerneesMin != null) {
      params = params.set('nombrePersonnesConcerneesMin', filters.nombrePersonnesConcerneesMin);
    }
    if (filters?.nombrePersonnesConcerneesMax != null) {
      params = params.set('nombrePersonnesConcerneesMax', filters.nombrePersonnesConcerneesMax);
    }

    return this.http.get<PageResponse<Violation>>(
      this.apiUrl + 'violations',
      { params }
    );
  }

  getViolationDetails(identifiant: string): Observable<ViolationDetails> {
    return this.http.get<ViolationDetails>(this.apiUrl + 'violations/' + identifiant);
  }

  updateViolation(identifiant: string, payload: ViolationDetails): Observable<ViolationDetails> {
    return this.http.put<ViolationDetails>(this.apiUrl + 'violations/' + identifiant, payload);
  }

  createViolation(payload: CreateViolationPayload): Observable<ViolationDetails> {
    return this.http.post<ViolationDetails>(this.apiUrl + 'violations', payload);
  }

  deleteViolation(identifiant: string): Observable<void> {
    return this.http.delete<void>(this.apiUrl + 'violations/' + identifiant);
  }

  genererFichierRegistretraitement(): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiUrl}importFichierRgpd/export`, {responseType: 'blob', observe: 'response'});
  }
}
