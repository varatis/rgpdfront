import { Injectable, inject } from '@angular/core';
import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class KeycloakService {
  private kc: Keycloak | undefined;
  private initialized = false;

  async init(): Promise<void> {
    this.kc = new Keycloak(environment.keycloak);
    try {
      const authenticated = await this.kc.init({
        onLoad: 'login-required',
        checkLoginIframe: false,
        // S'assurer que les tokens ne sont pas stockés de manière persistante
        // pour éviter les problèmes lors des changements de rôle
        token: undefined,
        refreshToken: undefined,
        idToken: undefined
      });
      this.initialized = true;
    } catch (error) {
      throw error;
    }
  }

  getToken(): string | null {
    return this.kc?.token ?? null;
  }

  isAuthenticated(): boolean {
    return !!this.kc && !this.kc.isTokenExpired() && this.initialized;
  }

  login(): void {
    this.kc?.login();
  }

  logout(): void {
    const redirectUri = window.location.origin + '/auth/login'; // Redirection après déconnexion

    // Nettoyer explicitement le localStorage et sessionStorage
    localStorage.clear();
    sessionStorage.clear();

    // Déconnexion Keycloak avec nettoyage complet
    this.kc?.logout({
      redirectUri,
      // Force le nettoyage de la session Keycloak
      // et évite la réutilisation des tokens
    });
  }

  getUserRole(): string | null {
    if (!this.kc?.tokenParsed) {
      return null;
    }

    // Récupérer les rôles depuis le token JWT
    const realmAccess = this.kc.tokenParsed['realm_access'];
    if (realmAccess && realmAccess['roles']) {
      const roles = realmAccess['roles'];
      // Mapping direct des rôles Keycloak vers les rôles application
      if (roles.includes('superadmin')) {
        return 'superadmin';
      }
      if (roles.includes('admin')) {
        return 'admin';
      }
      if (roles.includes('user')) {
        return 'client';
      }
    }

    // Chercher aussi dans resource_access si realm_access n'existe pas
    const resourceAccess = this.kc.tokenParsed['resource_access'];
    if (resourceAccess) {
      // Chercher spécifiquement dans minds-saas-rgpd pour le rôle Keycloak
      const mindsSaasRoles = resourceAccess['minds-saas-rgpd']?.['roles'];
      if (mindsSaasRoles && Array.isArray(mindsSaasRoles)) {
        // Mapping direct des rôles Keycloak vers les rôles application
        if (mindsSaasRoles.includes('superadmin')) {
          return 'superadmin';
        }
        if (mindsSaasRoles.includes('admin')) {
          return 'admin';
        }
        if (mindsSaasRoles.includes('user')) {
          return 'client';
        }
      }

      // Si pas trouvé dans minds-saas-rgpd, chercher dans toutes les ressources
      for (const resource in resourceAccess) {
        const roles = resourceAccess[resource]?.['roles'];
        if (roles && Array.isArray(roles)) {
          // Mapping direct des rôles Keycloak vers les rôles application
          if (roles.includes('superadmin')) {
            return 'superadmin';
          }
          if (roles.includes('admin')) {
            return 'admin';
          }
          if (roles.includes('user')) {
            return 'client';
          }
        }
      }
    }

    return 'client'; // Rôle par défaut
  }

  getUserEmail(): string | null {
    return this.kc?.tokenParsed?.['email'] ?? null;
  }

  getUserName(): string | null {
    return this.kc?.tokenParsed?.['name'] ?? null;
  }

  getClientGroups(): string[] {
    const groups = this.kc?.tokenParsed?.['client_groups'];
    return Array.isArray(groups) ? groups : [];
  }

  getClientName(): string | null {
    // Les groupes client sont au format "/clients/<nom-du-client>"
    for (const group of this.getClientGroups()) {
      const match = /^\/clients\/(.+)$/.exec(group);
      if (match) {
        return match[1];
      }
    }

    return null;
  }
}
