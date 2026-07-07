import { ApplicationConfig, APP_INITIALIZER, inject, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { KeycloakAuthInterceptor } from './core/auth/keycloak-auth.interceptor';
import { KeycloakService } from './core/auth/keycloak.service';

import { routes } from './app.routes';

function initializeKeycloak() {
  const keycloakService = inject(KeycloakService);
  return () => keycloakService.init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: KeycloakAuthInterceptor, multi: true },
    { provide: APP_INITIALIZER, useFactory: initializeKeycloak, multi: true },
  ]
};
