import { DestroyRef, Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';

import { ApiService } from '../../services/api.service';
import { KeycloakService } from '../auth/keycloak.service';
import { Client } from '../models/client.model';

/**
 * Client rattaché à l'utilisateur connecté, résolu à partir du groupe
 * `client_groups` du JWT. Partagé par la sidebar et les pages du domaine client
 * pour éviter que chacune refasse les mêmes appels.
 *
 * Les flux sont mis en cache (`shareReplay` sans `refCount`) : le client d'une
 * session ne change pas, un seul aller-retour suffit quel que soit le nombre
 * d'abonnés et quels que soient leurs cycles de vie.
 */
@Injectable({ providedIn: 'root' })
export class ClientCourantService {
  private readonly apiService = inject(ApiService);
  private readonly keycloakService = inject(KeycloakService);
  private readonly destroyRef = inject(DestroyRef);

  /** URL d'objet du logo, à révoquer pour ne pas fuir le blob. */
  private logoObjectUrl: string | null = null;

  /** Nom du tenant tel que porté par le JWT ; `null` pour un superadmin. */
  readonly nom: string | null;

  /** Fiche du client, ou `null` si l'utilisateur n'est rattaché à aucun client. */
  readonly client$: Observable<Client | null>;

  /** Nom d'affichage du client, avec repli sur le nom du groupe Keycloak. */
  readonly nomClient$: Observable<string>;

  /**
   * URL d'objet du logo, ou `null` quand le client n'en a pas (404) : c'est
   * l'état nominal, l'appelant retombe alors sur le visuel par défaut.
   */
  readonly logoUrl$: Observable<string | null>;

  constructor() {
    this.nom = this.keycloakService.getClientName();

    this.client$ = this.nom
      ? this.apiService.getClientByNom(this.nom).pipe(
          catchError(() => of(null)),
          shareReplay({ bufferSize: 1, refCount: false })
        )
      : of(null);

    this.nomClient$ = this.client$.pipe(map(client => client?.nom || this.nom || 'Client'));

    this.logoUrl$ = this.client$.pipe(
      switchMap(client =>
        client
          ? this.apiService.getClientLogo(String(client.id)).pipe(catchError(() => of(null)))
          : of(null)
      ),
      map(blob => {
        this.libererLogo();
        this.logoObjectUrl = blob ? URL.createObjectURL(blob) : null;
        return this.logoObjectUrl;
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    this.destroyRef.onDestroy(() => this.libererLogo());
  }

  private libererLogo(): void {
    if (this.logoObjectUrl) {
      URL.revokeObjectURL(this.logoObjectUrl);
      this.logoObjectUrl = null;
    }
  }
}
