import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { InfoFichier } from '../core/models/info-fichier.model';
import { Traitement } from '../core/models/traitement.model';
import { PageResponse } from '../core/models/page-response.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiURL;


  constructor(private http: HttpClient) { }

  getHelloMessage(): Observable<string> {
    return this.http.get(this.apiUrl + "helloworld", { responseType: 'text' });
  }

  uploadRgpdFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<InfoFichier>(this.apiUrl + "importFichierRgpd", formData);
  }


  getTraitements(page: number, size: number): Observable<PageResponse<Traitement>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'id,asc');

    return this.http.get<PageResponse<Traitement>>(
      this.apiUrl + "traitements",
      { params }
    );
  }



}