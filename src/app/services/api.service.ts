import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {}

  getHelloMessage(): Observable<string> {
    return this.http.get(this.apiUrl + "/helloworld", { responseType: 'text' });
  }
}