import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { inject } from '@angular/core';
import { KeycloakService } from './keycloak.service';

export class KeycloakAuthInterceptor implements HttpInterceptor {
  private auth = inject(KeycloakService);

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = this.auth.getToken();

    if (token) {
      const authReq = req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) });
      return next.handle(authReq);
    }
    return next.handle(req);
  }
}
