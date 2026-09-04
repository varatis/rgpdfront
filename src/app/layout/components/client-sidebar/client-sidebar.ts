import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { KeycloakService } from '../../../core/auth/keycloak.service';
import { ClientCourantService } from '../../../core/services/client-courant.service';
import { ADMIN_NAV_ITEMS, CLIENT_NAV_ITEMS } from '../../../shared/config/navigation.config';
import { UserRole } from '../../../shared/interfaces/navigation.interface';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-client-sidebar',
  imports: [RouterModule, MatIconModule],
  templateUrl: './client-sidebar.html',
  styleUrl: './client-sidebar.scss'
})
export class ClientSidebar {
  private readonly clientCourant = inject(ClientCourantService);

  currentUser: any;

  /**
   * Le rail de gauche est la version réduite de la sidebar du backoffice : il
   * n'a de sens que pour le superadmin, seul rôle qui y a accès. Les autres
   * rôles n'ont que la sidebar client, qui porte alors la déconnexion.
   */
  isSuperAdmin = computed(() => this.currentUser()?.role === 'superadmin');

  /** Mêmes entrées que la sidebar du backoffice, réduites à leur icône. */
  adminNavItems = ADMIN_NAV_ITEMS;

  navItems = computed(() => {
    const user = this.currentUser();
    if (!user) return [];

    // Filtrer les items selon le rôle de l'utilisateur
    const filtered = CLIENT_NAV_ITEMS.filter(item => item.roles.includes(user.role));
    return filtered;
  });

  /** Logo du client connecté ; `null` tant qu'il charge ou si le client n'en a pas. */
  private readonly logoClient = toSignal(this.clientCourant.logoUrl$, { initialValue: null });

  clientName = toSignal(this.clientCourant.nomClient$, {
    initialValue: this.clientCourant.nom || 'Client'
  });

  logo = computed(() => this.logoClient() ?? 'assets/images/client_logo.png');

  constructor(private keycloakService: KeycloakService) {
    this.currentUser = computed(() => {
      const role = this.keycloakService.getUserRole();
      const email = this.keycloakService.getUserEmail();
      return role ? { role, email } : null;
    });
  }

  getIconName(iconName: string): string {
    const icons: { [key: string]: string } = {
      'clients': 'business',
      'administrators': 'admin_panel_settings',
      'registre': 'library_books',
      'suivi': 'tune',
      'preconisations': 'tune',
      'demandes': 'contact_support',
      'violation': 'error',
      'sous-traitant': 'people'
    };
    return icons[iconName] || 'help';
  }

  logout(): void {
    this.keycloakService.logout();
  }

}
