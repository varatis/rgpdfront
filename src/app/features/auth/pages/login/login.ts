import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { KeycloakService } from '../../../../core/auth/keycloak.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private keycloakService: KeycloakService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Si déjà authentifié via Keycloak, rediriger
    if (this.keycloakService.isAuthenticated()) {
      this.redirectBasedOnRole();
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  async onSubmit(): Promise<void> {
    // Rediriger vers Keycloak pour l'authentification
    this.keycloakService.login();
  }

  private redirectBasedOnRole(): void {
    const role = this.keycloakService.getUserRole();

    // Redirection selon le rôle
    if (role === 'admin') {
      this.router.navigate(['/app/compte-client']);
    } else {
      this.router.navigate(['/app/registre-traitement']);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
