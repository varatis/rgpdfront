import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { InfoFichier } from '../core/models/info-fichier.model';
import { CreateTraitementPayload, Traitement, TraitementDetails } from '../core/models/traitement.model';
import { PageResponse } from '../core/models/page-response.model';
import { Etablissement } from '../core/models/etablissement.model';
import { Client } from '../core/models/client.model';
import { FiltreTraitementPayload } from '../core/models/filtre-traitement.payload';
import { FiltrePreconisationPayload } from '../core/models/filtre-preconisation.payload';
import {
  Preconisation,
  PreconisationDetails,
  PreconisationWritePayload
} from '../core/models/preconisation.model';
import { Demande } from '../core/models/demande.model';

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

  uploadRgpdFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<InfoFichier>(this.apiUrl + "importFichierRgpd", formData);
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

  createDemande(payload: any): Observable<any> {
    return this.http.post<any>(
      this.apiUrl + 'demandes',
      payload
    );
  }

  updateTraitement(id: number, payload: CreateTraitementPayload): Observable<TraitementDetails> {
    return this.http.put<TraitementDetails>(this.apiUrl + "traitements/" + id, payload);
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

  getClientByNom(nom: string): Observable<Client> {
    return this.http.get<Client>(this.apiUrl + "clients/nom/" + encodeURIComponent(nom));
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
}
