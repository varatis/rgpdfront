import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { KeycloakService } from '../../../core/auth/keycloak.service';
import { ADMIN_NAV_ITEMS } from '../../../shared/config/navigation.config';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.scss'
})
export class AdminSidebar {
  currentUser: any;
  navItems = ADMIN_NAV_ITEMS;

  logo = computed(() => 'assets/images/creative_logo.png');

  constructor(
    private keycloakService: KeycloakService,
    private router: Router
  ) {
    this.currentUser = computed(() => {
      const role = this.keycloakService.getUserRole();
      const email = this.keycloakService.getUserEmail();
      const name = this.keycloakService.getUserName();
      return role ? {
        role,
        email,
        name
      } : null;
    });
  }

  getIconName(iconName: string): string {
    const icons: { [key: string]: string } = {
      'clients': 'business',
      'administrators': 'admin_panel_settings',
      'preconisations': 'tune'
    };
    return icons[iconName] || 'help';
  }

  logout(): void {
    this.keycloakService.logout();
  }

}
