import { Component } from '@angular/core';
import { KeycloakService } from '../../../../core/auth/keycloak.service';

@Component({
  selector: 'app-access-denied',
  templateUrl: './access-denied.html',
  styleUrl: './access-denied.scss'
})
export class AccessDenied {
  constructor(private keycloakService: KeycloakService) {}

  logout(): void {
    this.keycloakService.logout();
  }
}
