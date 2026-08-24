import { Component, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { KeycloakService } from '../../../core/auth/keycloak.service';
import { CLIENT_NAV_ITEMS } from '../../../shared/config/navigation.config';
import { UserRole } from '../../../shared/interfaces/navigation.interface';

@Component({
  selector: 'app-client-sidebar',
  imports: [RouterModule, MatIconModule],
  templateUrl: './client-sidebar.html',
  styleUrl: './client-sidebar.scss'
})
export class ClientSidebar {
  private readonly keycloakService = inject(KeycloakService);
  private readonly location = inject(Location);

  currentUser = computed(() => {
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

  isEndUser = computed(() => this.currentUser()?.role === 'client');

  showClientMenu = signal(this.keycloakService.getUserRole() === 'client');

  navItems = computed(() => {
    const user = this.currentUser();
    if (!user) {
      return [];
    }
    return CLIENT_NAV_ITEMS.filter(item => item.roles.includes(user.role as UserRole));
  });

  logo = computed(() => this.currentUser()?.clientLogo || 'assets/images/creative_logo.png');

  clientName = computed(() => this.currentUser()?.clientName || 'Client');

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

  toggleClientMenu(): void {
    this.showClientMenu.update(v => !v);
  }

}
