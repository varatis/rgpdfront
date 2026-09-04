import { Component, DestroyRef, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, of } from 'rxjs';
import { catchError, finalize, switchMap, tap } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';

import { MasterDetailLayout } from '../../../../layout/master-detail-layout/master-detail-layout';
import { PageTabsComponent, PageTab } from '../../../../shared/components/page-tabs/page-tab/page-tab';
import { HeaderAction } from '../../../../shared/components/header/header';
import { ApiService } from '../../../../services/api.service';
import { Client, STATUT_CLIENT_ACTIF } from '../../../../core/models/client.model';
import {
  FILTRE_CLIENT_VIDE,
  FiltreClientPayload
} from '../../../../core/models/filtre-client.payload';
import { ClientModal } from './client-modal/client-modal';
import { FiltreClient } from './filtre-client/filtre-client';

type ClientTabKey = 'actuel' | 'archive';

@Component({
  selector: 'app-clients-list',
  standalone: true,
  imports: [
    CommonModule,
    MasterDetailLayout,
    PageTabsComponent,
    MatIconModule,
    ClientModal,
    FiltreClient
  ],
  templateUrl: './clients-list.html',
  styleUrl: './clients-list.scss'
})
export class ClientsList implements OnInit, OnDestroy {
  private readonly apiService = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  /** Chargement du logo du client sélectionné ; annule le précédent en vol. */
  private readonly logo$ = new Subject<Client>();

  pageTitle = 'Clients';
  clientIcon = 'business';
  actions: HeaderAction[] = [
    { label: 'Ajouter un client', icon: 'add', action: 'create', color: 'primary' },
    { label: 'Filtres', icon: 'tune', action: 'filter', color: 'default' }
  ];

  clientsActifs: Client[] = [];
  clientsArchives: Client[] = [];
  isLoading = false;
  erreurChargement: string | null = null;

  activeTab: ClientTabKey = 'actuel';

  /** Le panneau latéral porte soit les filtres, soit le détail d'un client. */
  filtreSelectionne = false;
  /**
   * Critères appliqués à la population de l'onglet courant. Le statut n'en fait
   * pas partie : les onglets « Actuel » / « Archivé » partitionnent déjà la liste
   * par `statut`, les filtres ne portent que sur les clients du statut affiché.
   */
  currentFilters: FiltreClientPayload = { ...FILTRE_CLIENT_VIDE };

  /** Exposé au template pour distinguer le badge de statut. */
  readonly statutActif = STATUT_CLIENT_ACTIF;

  selectedClient: Client | null = null;
  /** Ouvre le formulaire ; `clientAEditer` à `null` bascule le modal en création. */
  editionOuverte = false;
  clientAEditer: Client | null = null;
  /** URL d'objet du blob du logo, ou `null` quand le client n'en a pas. */
  logoUrl: string | null = null;
  logoEnCours = false;

  /** Verrouille le bouton pendant l'appel pour éviter une double suppression. */
  suppressionEnCours = false;
  erreurSuppression: string | null = null;

  /** Les compteurs d'onglets portent sur la même population que la liste : ils suivent les filtres. */
  get actuelsCount(): number {
    return this.appliquerFiltres(this.clientsActifs).length;
  }

  get archivesCount(): number {
    return this.appliquerFiltres(this.clientsArchives).length;
  }

  get pageTabs(): PageTab[] {
    return [
      { key: 'actuel', label: 'Actuel', count: this.actuelsCount },
      { key: 'archive', label: 'Archivé', count: this.archivesCount }
    ];
  }

  get displayedClients(): Client[] {
    return this.appliquerFiltres(
      this.activeTab === 'actuel' ? this.clientsActifs : this.clientsArchives
    );
  }

  get hasActiveFilters(): boolean {
    const filtres = this.currentFilters;

    return !!filtres.nom
      || !!filtres.version
      || !!filtres.dateVersionDebut
      || !!filtres.dateVersionFin;
  }

  get isDetailOpen(): boolean {
    return this.filtreSelectionne || !!this.selectedClient;
  }

  get detailTitle(): string {
    if (this.filtreSelectionne) {
      return 'Filtres';
    }

    return this.selectedClient?.nom ?? 'Détails Client';
  }

  /** Distingue « la liste est vide » de « aucun client ne passe les filtres ». */
  get messageListeVide(): string {
    return this.hasActiveFilters
      ? 'Aucun client ne correspond aux filtres.'
      : 'Aucun client à afficher.';
  }

  ngOnInit(): void {
    this.logo$
      .pipe(
        tap(() => this.libererLogo()),
        switchMap(client => {
          this.logoEnCours = true;

          return this.apiService.getClientLogo(String(client.id)).pipe(
            // 404 = client sans logo : état nominal, on retombe sur le visuel par défaut.
            catchError(() => of(null)),
            finalize(() => (this.logoEnCours = false))
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(blob => {
        this.logoUrl = blob ? URL.createObjectURL(blob) : null;
      });

    this.chargerClients();
  }

  ngOnDestroy(): void {
    this.libererLogo();
  }

  onSelectClient(client: Client): void {
    // Le panneau latéral est unique : ouvrir un détail referme les filtres,
    // sans perdre les critères déjà appliqués.
    this.filtreSelectionne = false;
    this.selectedClient = client;
    this.erreurSuppression = null;
    this.logo$.next(client);
  }

  onCloseDetail(): void {
    this.filtreSelectionne = false;
    this.clearSelection();
  }

  setActiveTab(key: string): void {
    this.activeTab = key as ClientTabKey;
    // La sélection ne survit pas au changement d'onglet, les critères en cours
    // de saisie dans le panneau de filtres, si.
    this.clearSelection();
  }

  onHeaderAction(action: string): void {
    switch (action) {
      case 'create':
        this.onCreateClient();
        break;
      case 'filter':
        this.onFilterClients();
        break;
    }
  }

  onCreateClient(): void {
    this.clientAEditer = null;
    this.editionOuverte = true;
  }

  onEditClient(client: Client): void {
    this.clientAEditer = client;
    this.editionOuverte = true;
  }

  onEditionFermee(): void {
    this.editionOuverte = false;
    this.clientAEditer = null;
  }

  /**
   * Le client renvoyé par l'API fait autorité : la liste est rechargée pour que
   * le changement de statut rebascule la ligne dans le bon onglet, et le détail
   * ouvert est rafraîchi sur la version enregistrée.
   */
  onClientEnregistre(client: Client): void {
    if (this.selectedClient?.id === client.id) {
      this.selectedClient = client;
    }

    this.chargerClients();
  }

  onFilterClients(): void {
    this.clearSelection();
    this.filtreSelectionne = true;
  }

  onFiltreChange(filtre: FiltreClientPayload): void {
    this.currentFilters = filtre;
    this.syncFilterAction();
    // Le client ouvert peut sortir de la population filtrée : on referme le détail
    // plutôt que de laisser un panneau sur une ligne absente de la liste.
    this.clearSelection();
  }

  onFiltreClose(): void {
    this.filtreSelectionne = false;
  }

  onArchiveClient(client: Client): void {}

  /** Supprime le client ouvert dans le détail, après confirmation. */
  onDeleteClient(client: Client): void {
    if (this.suppressionEnCours) {
      return;
    }

    if (!window.confirm(`Supprimer le client ${client.nom} ?`)) {
      return;
    }

    this.suppressionEnCours = true;
    this.erreurSuppression = null;

    this.apiService
      .deleteClient(String(client.id))
      .pipe(
        finalize(() => (this.suppressionEnCours = false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.onCloseDetail();
          this.chargerClients();
        },
        error: () => {
          this.erreurSuppression = 'La suppression du client a échoué.';
        }
      });
  }

  private chargerClients(): void {
    this.isLoading = true;
    this.erreurChargement = null;

    this.apiService
      .getClients()
      .pipe(
        finalize(() => (this.isLoading = false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: clients => {
          this.clientsActifs = clients.filter(c => c.statut === STATUT_CLIENT_ACTIF);
          this.clientsArchives = clients.filter(c => c.statut !== STATUT_CLIENT_ACTIF);
        },
        error: () => {
          this.clientsActifs = [];
          this.clientsArchives = [];
          this.erreurChargement = 'Le chargement des clients a échoué.';
        }
      });
  }

  /** Ferme le détail sans toucher au panneau de filtres. */
  private clearSelection(): void {
    this.selectedClient = null;
    this.erreurSuppression = null;
    this.libererLogo();
  }

  /** Le bouton « Filtres » passe en primaire tant qu'un critère est actif. */
  private syncFilterAction(): void {
    const filtre = this.actions.find(action => action.action === 'filter');

    if (filtre) {
      filtre.color = this.hasActiveFilters ? 'primary' : 'default';
    }
  }

  /**
   * Filtrage côté front : `GET /clients` renvoie la liste complète, sans
   * pagination ni paramètre de recherche. Les critères se cumulent (ET).
   */
  private appliquerFiltres(clients: Client[]): Client[] {
    if (!this.hasActiveFilters) {
      return clients;
    }

    const nom = this.normaliser(this.currentFilters.nom);
    const version = this.normaliser(this.currentFilters.version);
    const debut = this.currentFilters.dateVersionDebut;
    const fin = this.currentFilters.dateVersionFin;

    return clients.filter(client => {
      if (nom && !this.normaliser(client.nom).includes(nom)) {
        return false;
      }

      if (version && !this.normaliser(client.version).includes(version)) {
        return false;
      }

      if (debut || fin) {
        // Un client sans date de version ne peut satisfaire une borne : il sort.
        const dateVersion = this.dateSeule(client.dateVersion);

        if (!dateVersion) {
          return false;
        }

        // Comparaison lexicographique : valide sur du `yyyy-MM-dd`, bornes incluses.
        if (debut && dateVersion < debut) {
          return false;
        }

        if (fin && dateVersion > fin) {
          return false;
        }
      }

      return true;
    });
  }

  /** Minuscules sans accents : « Établissement » doit répondre à « etabl ». */
  private normaliser(valeur?: string): string {
    return (valeur ?? '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .trim();
  }

  /** Isole la partie date : le back peut renvoyer un `LocalDate` ou un instant ISO. */
  private dateSeule(valeur?: string): string {
    return (valeur ?? '').slice(0, 10);
  }

  /** Révoque l'URL d'objet en cours : sans cela le blob reste retenu en mémoire. */
  private libererLogo(): void {
    if (this.logoUrl) {
      URL.revokeObjectURL(this.logoUrl);
    }

    this.logoUrl = null;
  }
}
