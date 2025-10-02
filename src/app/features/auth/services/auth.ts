import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import { User } from '../../../core/models/user.model';
import { LoginRequest, LoginResponse } from '../../../core/models/login.model';



@Injectable({
  providedIn: 'root'
})
export class Auth {
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Utilisateurs mockés pour les tests
  private mockUsers = [
    {
      id: 1,
      nom: 'Doe',
      prenom: 'John',
      email: 'admin@creative.com',
      password: 'admin123',
      role: 'admin' as const,
      token: 'mock-jwt-token-admin-123'
    },
    {
      id: 2,
      nom: 'Smith',
      prenom: 'Jane',
      email: 'user@creative.com',
      password: 'user123',
      role: 'user' as const,
      token: 'mock-jwt-token-user-456'
    }
  ];

  constructor() {
    // Charger l'utilisateur depuis le localStorage si existe
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    // Simuler un appel API avec délai
    return of(credentials).pipe(
      delay(1000), // Simule la latence réseau
      switchMap((creds) => {
        // Chercher l'utilisateur dans les données mockées
        const user = this.mockUsers.find(
          u => u.email === creds.email && u.password === creds.password
        );

        if (user) {
          const { password, ...userWithoutPassword } = user;
          const response: LoginResponse = {
            user: userWithoutPassword,
            token: user.token
          };
          
          // Stocker l'utilisateur dans localStorage
          localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
          localStorage.setItem('token', user.token);
          
          this.currentUserSubject.next(userWithoutPassword);
          
          return of(response);
        } else {
          return throwError(() => new Error('Email ou mot de passe incorrect'));
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}