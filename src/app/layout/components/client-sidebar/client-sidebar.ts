import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { KeycloakService } from '../../../core/auth/keycloak.service';
import { Location } from '@angular/common';
import { computed } from '@angular/core';
import { CLIENT_NAV_ITEMS } from '../../../shared/config/navigation.config';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-client-sidebar',
  imports: [RouterModule, MatIconModule],
  templateUrl: './client-sidebar.html',
  styleUrl: './client-sidebar.scss'
})
export class ClientSidebar {
  currentUser: any;
  navItems = computed(() => {
    const user = this.currentUser();
    if (!user) return [];

    // Filtrer les items selon le rôle de l'utilisateur
    const filtered = CLIENT_NAV_ITEMS.filter(item => item.roles.includes(user.role));
    return filtered;
  });

  logo = computed(() => {
    const user = this.currentUser();
    return user?.clientLogo || 'assets/images/creative_logo.png';
  });

  clientName = computed(() => {
    return this.currentUser()?.clientName || 'Client';
  });

  constructor(
    private keycloakService: KeycloakService,
    private location: Location
  ) {
    this.currentUser = computed(() => {
      const role = this.keycloakService.getUserRole();
      const email = this.keycloakService.getUserEmail();
      const name = this.keycloakService.getUserName();
      return role ? {
        role,
        email,
        clientName: name || 'Client',
        clientLogo: 'assets/images/client_logo.png'
      } : null;
    });
  }

  getIconName(iconName: string): string {
    const icons: { [key: string]: string } = {
      'clients': 'business',
      'registre': 'library_books',
      'suivi': 'checklist',
      'demandes': 'contact_support',
      'violation': 'error',
      'sous-traitant': 'people'
    };
    return icons[iconName] || 'help';
  }

  goBack(): void {
    this.location.back();
  }

  logout(): void {
    this.keycloakService.logout();
  }



}
