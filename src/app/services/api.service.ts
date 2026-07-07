import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { InfoFichier } from '../core/models/info-fichier.model';
import { CreateTraitementPayload, Traitement, TraitementDetails } from '../core/models/traitement.model';
import { PageResponse } from '../core/models/page-response.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiURL;


  constructor(private http: HttpClient) { }

  uploadRgpdFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<InfoFichier>(this.apiUrl + "importFichierRgpd", formData);
  }


  getTraitements(page: number, size: number, sortField: string = 'id', 
      sortDirection: 'asc' | 'desc' = 'asc'): Observable<PageResponse<Traitement>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', `${sortField},${sortDirection}`);

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

  updateTraitement(id: number, payload: CreateTraitementPayload): Observable<TraitementDetails> {
    return this.http.put<TraitementDetails>(this.apiUrl + "traitements/" + id, payload);
  }

  deleteTraitement(id: number): Observable<void> {
    return this.http.delete<void>(this.apiUrl + "traitements/" + id);
  }

  getNextTraitementId(): Observable<Number> {
    return this.http.get<Number>(this.apiUrl + "traitements/nextId");
  }
}
