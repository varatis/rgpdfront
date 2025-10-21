import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { signal, computed } from '@angular/core';
import { UserProfile, UserRole } from '../../../shared/interfaces/navigation.interface';



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
   private currentUserSignal = signal<UserProfile | null>(null);
  currentUser = this.currentUserSignal.asReadonly();

  constructor(private router: Router) {
    this.loadUserFromStorage();
  }

  login(email: string, password: string): Promise<boolean> {
    return new Promise((resolve) => {
     
      setTimeout(() => {
        let user: UserProfile;
        if (email.includes('admin')) {
          user = {
            id: '1',
            email: email,
            role: 'admin'
          };
        } else if (email.includes('client')) {
          user = {
            id: '2',
            email: email,
            role: 'client',
            clientLogo: 'assets/images/client_logo.png',
            clientName: 'Abstergo Ltd.'
          };
        } else  {
          user = {
            id: '3',
            email: email,
            role: 'user',
            clientLogo: 'assets/images/client_logo.png',
            clientName: 'Abstergo Ltd.'
          };
        }

        this.setUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        resolve(true);
      }, 1000);
    });
  }

  logout(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem('currentUser');
    this.router.navigate(['/auth/login']);
  }

  private setUser(user: UserProfile): void {
    this.currentUserSignal.set(user);
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.setUser(user);
    }
    console.log('Loaded user from storage:', this.currentUserSignal());
  }

  isAuthenticated(): boolean {
    return this.currentUserSignal() !== null;
  }

  getUserRole(): UserRole | null {
    return this.currentUserSignal()?.role || null;
  }
}