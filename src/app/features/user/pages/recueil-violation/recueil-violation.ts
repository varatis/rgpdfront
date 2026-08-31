import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, forkJoin, of } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { HeaderAction } from '../../../../shared/components/header/header';
import { MasterDetailLayout } from '../../../../layout/master-detail-layout/master-detail-layout';
import { PageTab, PageTabsComponent } from '../../../../shared/components/page-tabs/page-tab/page-tab';
import { DataTable, TableColumn, TableSort } from '../../../../shared/components/data-table/data-table';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { ApiService } from '../../../../services/api.service';
import { KeycloakService } from '../../../../core/auth/keycloak.service';
import { PageResponse } from '../../../../core/models/page-response.model';
import { FILTRE_VIOLATION_VIDE, FiltreViolationPayload } from '../../../../core/models/filtre-violation.payload';
import { FiltreViolation } from './filtre-violation/filtre-violation';
import { ViolationModal } from './violation-modal/violation-modal';
import {
  Violation,
  ViolationDetails,
  ViolationSortField,
  ViolationStatut
} from '../../../../core/models/violation.model';

/** Onglets de la page ; chacun correspond à un statut persisté côté API. */
export type ViolationTabKey = 'pending' | 'treated';

const TAB_STATUTS: Record<ViolationTabKey, ViolationStatut> = {
  pending: 'EN_COURS',
  treated: 'TRAITEE'
};

interface ViolationRow {
  identifiant: string;
  dateViolation: string;
  natureViolation: string;
  donneesConcernees: string;
  nombrePersonnesConcernees: string;
  risqueEleveDroitsLibertes: string;
  _raw: Violation;
}

@Component({
  selector: 'app-recueil-violation',
  imports: [
    CommonModule,
    MasterDetailLayout,
    PageTabsComponent,
    DataTable,
    Pagination,
    MatIconModule,
    FiltreViolation,
    ViolationModal
  ],
  templateUrl: './recueil-violation.html',
  styleUrl: './recueil-violation.scss'
})
export class RecueilViolation implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly keycloakService = inject(KeycloakService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  private readonly load$ = new Subject<number>();
  private readonly details$ = new Subject<string>();

  pageTitle = 'Recueil de violation';
  icon = 'error';

  actions: HeaderAction[] = [
    { label: 'Filtres', icon: 'tune', action: 'filter', color: 'default' }
  ];

  tableColumns: TableColumn[] = [
    { key: 'dateViolation', label: 'Date', sortable: true, width: '140px', dropOrder: 4 },
    { key: 'natureViolation', label: 'Nature de la violation DCP', sortable: true, width: 'auto' },
    { key: 'donneesConcernees', label: 'Données concernées', sortable: true, width: '240px', dropOrder: 3 },
    { key: 'nombrePersonnesConcernees', label: 'Personnes concernées', sortable: true, width: '200px', dropOrder: 1 },
    { key: 'risqueEleveDroitsLibertes', label: 'Risque élevé', sortable: true, width: '140px', dropOrder: 2 }
  ];

  activeTab: ViolationTabKey = 'pending';
  violations: Violation[] = [];
  counts: Record<ViolationTabKey, number> = { pending: 0, treated: 0 };

  selectedViolation: Violation | null = null;
  selectedDetails: ViolationDetails | null = null;
  filtreSelectionne = false;
  editionOuverte = false;
  creationOuverte = false;
  currentFilters: FiltreViolationPayload = { ...FILTRE_VIOLATION_VIDE };

  currentPage = 1;
  size = 10;
  totalElements = 0;
  totalPages = 0;
  sortField: ViolationSortField = 'dateViolation';
  sortDirection: 'asc' | 'desc' = 'desc';
  loading = false;
  detailsLoading = false;
  error: string | null = null;

  ngOnInit(): void {
    // La déclaration d'une violation est réservée à l'admin, comme la modification.
    if (this.isAdmin) {
      this.actions = [
        ...this.actions,
        { label: 'Ajouter une violation', icon: 'add', action: 'create', color: 'primary' }
      ];
    }

    this.load$.pipe(
      switchMap((page) => {
        this.loading = true;
        this.error = null;
        return this.apiService.getViolations(
          page,
          this.size,
          this.sortField,
          this.sortDirection,
          this.clientNom,
          TAB_STATUTS[this.activeTab],
          this.currentFilters
        ).pipe(
          catchError((err) => {
            console.error(err);
            this.violations = [];
            this.totalElements = 0;
            this.totalPages = 0;
            this.error = 'Impossible de charger les violations.';
            return EMPTY;
          }),
          finalize(() => this.loading = false)
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((res: PageResponse<Violation>) => {
      this.violations = res.content ?? [];
      this.size = res.size;
      this.totalElements = res.totalElements;
      this.totalPages = res.totalPages;
      this.currentPage = res.number + 1;
      // Le total de l'onglet affiché est déjà dans la réponse : inutile de le recompter.
      this.counts[this.activeTab] = res.totalElements;
    });

    this.details$.pipe(
      switchMap((identifiant) => {
        this.detailsLoading = true;
        return this.apiService.getViolationDetails(identifiant).pipe(
          catchError((err) => {
            console.error(err);
            return EMPTY;
          }),
          finalize(() => this.detailsLoading = false)
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((details) => {
      if (this.selectedViolation?.identifiant === details.identifiant) {
        this.selectedDetails = details;
      }
    });

    this.loadCounts();
    this.loadViolations(0);
  }

  get pageTabs(): PageTab[] {
    return [
      { key: 'pending', label: 'En cours de traitement', count: this.counts.pending },
      { key: 'treated', label: 'Traité', count: this.counts.treated }
    ];
  }

  get emptyMessage(): string {
    if (this.error) {
      return this.error;
    }
    if (this.hasActiveFilters) {
      return 'Aucune violation ne correspond aux filtres';
    }
    return this.activeTab === 'pending'
      ? 'Aucune violation en cours de traitement'
      : 'Aucune violation traitée';
  }

  get hasActiveFilters(): boolean {
    const filtres = this.currentFilters;
    return !!filtres.natureViolation
      || !!filtres.donneesConcernees
      || filtres.risqueEleveDroitsLibertes !== null
      || !!filtres.dateViolationDebut
      || !!filtres.dateViolationFin
      || filtres.nombrePersonnesConcerneesMin !== null
      || filtres.nombrePersonnesConcerneesMax !== null;
  }

  /** Modification réservée à l'admin, comme sur le registre des traitements. */
  get isAdmin(): boolean {
    return this.keycloakService.getUserRole() === 'admin';
  }

  /** Le panneau latéral porte soit les filtres, soit le détail d'une violation. */
  get isDetailOpen(): boolean {
    return this.filtreSelectionne || !!this.selectedViolation;
  }

  get detailTitle(): string {
    if (this.filtreSelectionne) {
      return 'Filtres';
    }
    return this.selectedDetails?.natureViolation
      || this.selectedViolation?.natureViolation
      || 'Détails';
  }

  /** Violation affichée au détail : la vue résumée tant que le détail complet n'est pas arrivé. */
  get detailView(): ViolationDetails | Violation | null {
    if (this.filtreSelectionne) {
      return null;
    }
    return this.selectedDetails ?? this.selectedViolation;
  }

  get displayedViolations(): ViolationRow[] {
    return this.violations.map(violation => ({
      identifiant: violation.identifiant,
      dateViolation: this.formatDate(violation.dateViolation),
      natureViolation: this.value(violation.natureViolation),
      donneesConcernees: this.value(violation.donneesConcernees),
      nombrePersonnesConcernees: this.value(violation.nombrePersonnesConcernees),
      risqueEleveDroitsLibertes: this.formatBoolean(violation.risqueEleveDroitsLibertes),
      _raw: violation
    }));
  }

  private get clientNom(): string | undefined {
    return this.keycloakService.getClientName() ?? undefined;
  }

  /** `LocalDate` (`yyyy-MM-dd`) formatée sans passer par `Date`, qui décalerait le jour selon le fuseau. */
  formatDate(date?: string): string {
    if (!date) {
      return '—';
    }
    const [annee, mois, jour] = date.split('-');
    return annee && mois && jour ? `${jour}/${mois}/${annee}` : date;
  }

  formatBoolean(value?: boolean): string {
    if (value === null || value === undefined) {
      return '—';
    }
    return value ? 'Oui' : 'Non';
  }

  value(value?: string | number | null): string {
    if (value === null || value === undefined || value === '') {
      return '—';
    }
    return String(value);
  }

  /** Champ présent uniquement sur le détail complet : vide tant que celui-ci n'est pas chargé. */
  detailField(details: ViolationDetails | Violation, field: keyof ViolationDetails): string {
    return this.value((details as ViolationDetails)[field] as string | number | undefined);
  }

  loadViolations(page: number): void {
    this.load$.next(page);
  }

  setActiveTab(key: string): void {
    this.activeTab = key as ViolationTabKey;
    this.currentPage = 1;
    this.clearSelection();
    this.loadViolations(0);
  }

  onSortChange(sort: TableSort): void {
    this.sortField = sort.field as ViolationSortField;
    this.sortDirection = sort.direction;
    this.currentPage = 1;
    this.loadViolations(0);
  }

  onSelectViolation(row: ViolationRow): void {
    const violation = row._raw;
    if (this.selectedViolation?.identifiant === violation.identifiant) {
      this.onCloseDetail();
      return;
    }

    this.filtreSelectionne = false;
    this.selectedViolation = violation;
    this.selectedDetails = null;
    this.details$.next(violation.identifiant);
  }

  onCloseDetail(): void {
    this.clearSelection();
    this.filtreSelectionne = false;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      // La sélection ne survit pas au changement de page, mais les critères en cours de
      // saisie dans le panneau de filtres, si.
      this.clearSelection();
      this.loadViolations(page - 1);
    }
  }

  private clearSelection(): void {
    this.selectedViolation = null;
    this.selectedDetails = null;
    this.detailsLoading = false;
    this.editionOuverte = false;
  }

  onEditViolation(): void {
    if (this.isAdmin && this.selectedDetails) {
      this.editionOuverte = true;
    }
  }

  onEditClose(): void {
    this.editionOuverte = false;
  }

  onCreateViolation(): void {
    if (this.isAdmin) {
      this.creationOuverte = true;
    }
  }

  onCreateClose(): void {
    this.creationOuverte = false;
  }

  /**
   * La violation créée n'est pas forcément dans l'onglet courant : on se place sur
   * celui de son statut, puis on recharge la première page et les compteurs.
   */
  onViolationCreated(violation: ViolationDetails): void {
    this.activeTab = violation.statut === 'TRAITEE' ? 'treated' : 'pending';
    this.currentPage = 1;
    this.clearSelection();
    this.loadCounts();
    this.loadViolations(0);
  }

  onDeleteViolation(): void {
    const violation = this.selectedViolation;

    if (!this.isAdmin || !violation) {
      return;
    }

    const libelle = violation.natureViolation ?? 'cette violation';
    if (!window.confirm(`Supprimer la violation « ${libelle} » ?`)) {
      return;
    }

    this.apiService.deleteViolation(violation.identifiant)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackBar.open('Violation supprimée avec succès', 'OK', {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
          });
          // Dernière ligne de la page : on recule d'une page pour ne pas afficher un écran vide.
          const page = this.violations.length === 1 && this.currentPage > 1
            ? this.currentPage - 2
            : this.currentPage - 1;
          this.clearSelection();
          this.loadCounts();
          this.loadViolations(page);
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open('Erreur lors de la suppression de la violation', 'Fermer', {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
        }
      });
  }

  /**
   * Le statut peut avoir changé d'onglet : la liste et les compteurs sont rechargés,
   * le détail est remplacé par la réponse du PUT sans requête supplémentaire.
   */
  onViolationUpdated(violation: ViolationDetails): void {
    this.selectedDetails = violation;
    this.selectedViolation = violation;
    this.loadCounts();
    this.loadViolations(this.currentPage - 1);
  }

  onHeaderAction(action: string): void {
    switch (action) {
      case 'create':
        this.onCreateViolation();
        break;
      case 'filter':
        this.onFilterViolations();
        break;
    }
  }

  onFilterViolations(): void {
    this.clearSelection();
    this.filtreSelectionne = true;
  }

  onFiltreChange(filtre: FiltreViolationPayload): void {
    this.currentFilters = filtre;
    this.currentPage = 1;
    this.syncFilterAction();
    // Les compteurs d'onglets portent sur la même population que la liste : ils suivent les filtres.
    this.loadCounts();
    this.loadViolations(0);
  }

  onFiltreClose(): void {
    this.filtreSelectionne = false;
  }

  /** Le bouton « Filtres » passe en primaire tant qu'un critère est actif. */
  private syncFilterAction(): void {
    const filtre = this.actions.find(action => action.action === 'filter');
    if (filtre) {
      filtre.color = this.hasActiveFilters ? 'primary' : 'default';
    }
  }

  /**
   * Les compteurs d'onglets portent sur les deux statuts : seul celui de l'onglet actif
   * ressort de la liste paginée, l'autre demande une requête dédiée (une ligne suffit,
   * seul `totalElements` est lu).
   */
  private loadCounts(): void {
    const countOf = (statut: ViolationStatut) => this.apiService
      .getViolations(0, 1, this.sortField, this.sortDirection, this.clientNom, statut, this.currentFilters)
      .pipe(catchError(() => of({ totalElements: 0 } as PageResponse<Violation>)));

    forkJoin({
      pending: countOf(TAB_STATUTS.pending),
      treated: countOf(TAB_STATUTS.treated)
    }).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(({ pending, treated }) => {
      this.counts = {
        pending: pending.totalElements ?? 0,
        treated: treated.totalElements ?? 0
      };
    });
  }
}
