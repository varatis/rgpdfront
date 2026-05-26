import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';
import { Router } from '@angular/router';

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
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;

      const { email, password } = this.loginForm.value;

      try {
        const success = this.authService.login(email, password);

        if (await success) {

          const role = this.authService.getUserRole();

          if (role === 'admin') {
            this.router.navigate(['/app/compte-client']);
          } else if (role === 'client') {
            this.router.navigate(['/app/compte-client']);
          } else if (role === 'user') {
            this.router.navigate(['/app/registre-traitement']);
          }
        } else {
          this.errorMessage = 'Identifiants invalides';
        }
      } catch (error) {
        this.errorMessage = 'Une erreur est survenue lors de la connexion';
      } finally {
        this.isLoading = false;
      }
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
