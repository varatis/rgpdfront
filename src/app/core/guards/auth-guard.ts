import { CanActivateFn, Router } from '@angular/router';
import { KeycloakService } from '../auth/keycloak.service';
import { inject } from '@angular/core';

type AppRole = 'superadmin' | 'admin' | 'client' | 'user';

function redirectToRoleHome(router: Router, role: string | null): void {
  if (role === 'admin') {
    router.navigate(['/app/compte-client']);
    return;
  }

  router.navigate(['/app/registre-traitement']);
}

export const authGuard: CanActivateFn = (route, state) => {
  const keycloakService = inject(KeycloakService);
  const router = inject(Router);

  if (!keycloakService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  const role = keycloakService.getUserRole();
  if (role !== 'superadmin' && !keycloakService.getClientName()) {
    router.navigate(['/auth/access-denied']);
    return false;
  }

  return true;
};

// Guard pour protéger les routes admin
export const adminGuard: CanActivateFn = (route, state) => {
  const keycloakService = inject(KeycloakService);
  const router = inject(Router);

  if (!keycloakService.isAuthenticated()) {
    router.navigate(['/']);
    return false;
  }

  redirectToRoleHome(router, keycloakService.getUserRole());
  return false;
};

// Guard pour protéger les routes client/user
export const clientGuard: CanActivateFn = (route, state) => {
  const keycloakService = inject(KeycloakService);
  const router = inject(Router);

  if (keycloakService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};

export const roleGuard: CanActivateFn = (route, state) => {
  const keycloakService = inject(KeycloakService);
  const router = inject(Router);
  const role = keycloakService.getUserRole();
  const allowedRoles = (route.data?.['roles'] ?? []) as AppRole[];

  if (role && allowedRoles.includes(role as AppRole)) {
    return true;
  }

  redirectToRoleHome(router, role);
  return false;
};
