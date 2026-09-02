import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EMPTY, Subject } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { KeycloakService } from '../../../../core/auth/keycloak.service';
import {
  avancementClass,
  complexiteClass,
  displayValue,
  parseAvancementPercent,
  Preconisation,
  PreconisationDetails,
  PreconisationSortField,
  prioriteClass,
  scaleLabel,
  splitPreconisationCommentaire
} from '../../../../core/models/preconisation.model';
import { ApiService } from '../../../../services/api.service';
import { MasterDetailLayout } from '../../../../layout/master-detail-layout/master-detail-layout';
import { HeaderAction } from '../../../../shared/components/header/header';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import {
  PreconisationsTable,
  PreconisationSortEvent
} from '../../../../shared/components/preconisations-table/preconisations-table';
import { FiltrePreconisation } from './filtre-preconisation/filtre-preconisation';
import { CreatePreconisationModal } from './create-preconisation-modal/create-preconisation-modal';
import { FiltrePreconisationPayload } from '../../../../core/models/filtre-preconisation.payload';
import { PageResponse } from '../../../../core/models/page-response.model';
import { Modal } from '../../../../shared/components/modal/modal';

@Component({
  selector: 'app-suivi-preconisations',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatSnackBarModule,
    MasterDetailLayout,
    Pagination,
    PreconisationsTable,
    FiltrePreconisation,
    CreatePreconisationModal
  ],
  templateUrl: './suivi-preconisations.html',
  styleUrl: './suivi-preconisations.scss'
})
export class SuiviPreconisations implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly keycloakService = inject(KeycloakService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly load$ = new Subject<number>();
  private readonly details$ = new Subject<string>();

  pageTitle = 'Gestion des préconisations';
  icon = 'tune';

  private readonly exportAction: HeaderAction = {
    label: 'Export global',
    icon: 'download',
    action: 'export',
    color: 'default'
  };
  private readonly filterAction: HeaderAction = {
    label: 'Filtres',
    icon: 'tune',
    action: 'filter',
    color: 'default',
    testId: '_btn_filtres_preconisations'
  };
  private readonly addAction: HeaderAction = {
    label: 'Ajouter une préconisation',
    icon: 'add',
    action: 'add',
    color: 'primary',
    testId: '_btn_ajouter_preconisation'
  };

  /**
   * Comme pour le registre des traitements, seul un administrateur reçoit
   * l’action d’écriture. La liste et le détail restent disponibles pour les
   * rôles user/client.
   */
  get isAdmin(): boolean {
    return this.keycloakService.getUserRole() === 'admin';
  }

  get actions(): HeaderAction[] {
    return this.isAdmin
      ? [this.exportAction, this.filterAction, this.addAction]
      : [this.exportAction, this.filterAction];
  }

  data: Preconisation[] = [];
  selectedPreconisation: Preconisation | null = null;
  selectedDetails: PreconisationDetails | null = null;
  filtreSelectionne = false;
  showCreateModal = false;
  showEditModal = false;
  isDeleting = false;

  currentFilters: FiltrePreconisationPayload = {
    libelle: ''
  };

  currentPage = 1;
  page = 0;
  size = 20;
  totalElements = 0;
  totalPages = 0;
  sortField: PreconisationSortField = 'libelle';
  sortDirection: 'asc' | 'desc' = 'asc';
  loading = false;
  detailsLoading = false;
  error: string | null = null;

  get isDetailOpen(): boolean {
    return !!this.selectedPreconisation;
  }

  get detailTitle(): string {
    if (this.filtreSelectionne) {
      return 'Filtres';
    }
    return this.selectedDetails?.libelle
      || this.selectedPreconisation?.libelle
      || 'Détails';
  }

  get displayedDetails(): PreconisationDetails | Preconisation | null {
    return this.selectedDetails ?? this.selectedPreconisation;
  }

  get detailView(): PreconisationDetails | Preconisation | null {
    return this.filtreSelectionne ? null : this.displayedDetails;
  }

  ngOnInit(): void {
    this.load$.pipe(
      switchMap(page => {
        this.loading = true;
        this.error = null;
        const clientNom = this.keycloakService.getClientName() ?? undefined;

        return this.apiService.getPreconisations(
          page,
          this.size,
          this.sortField,
          this.sortDirection,
          clientNom,
          this.currentFilters
        ).pipe(
          catchError(error => {
            console.error(error);
            this.data = [];
            this.totalPages = 0;
            this.totalElements = 0;
            this.error = 'Impossible de charger les préconisations.';
            return EMPTY;
          }),
          finalize(() => this.loading = false)
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((response: PageResponse<Preconisation>) => {
      this.data = (response.content ?? []).map(item => this.normalizeScales(item));
      this.page = response.number;
      this.size = response.size;
      this.totalElements = response.totalElements;
      this.totalPages = response.totalPages;
      this.currentPage = response.number + 1;
    });

    this.details$.pipe(
      switchMap(identifiant => {
        this.detailsLoading = true;
        return this.apiService.getPreconisationDetails(identifiant).pipe(
          catchError(error => {
            console.error(error);
            return EMPTY;
          }),
          finalize(() => this.detailsLoading = false)
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(details => {
      if (this.selectedPreconisation?.identifiant === details.identifiant) {
        this.selectedDetails = this.normalizeScales(details);
      }
    });

    this.loadPreconisations(0);
  }

  loadPreconisations(page: number): void {
    this.load$.next(page);
  }

  onSelectPreconisation(item: Preconisation): void {
    if (this.selectedPreconisation?.identifiant === item.identifiant) {
      this.onCloseDetail();
      return;
    }

    this.filtreSelectionne = false;
    this.selectedPreconisation = item;
    this.selectedDetails = null;
    this.details$.next(item.identifiant);
  }

  onCloseDetail(): void {
    this.selectedPreconisation = null;
    this.selectedDetails = null;
    this.filtreSelectionne = false;
    this.detailsLoading = false;
  }

  onHeaderAction(action: string): void {
    switch (action) {
      case 'add':
        this.onCreatePreconisation();
        break;
      case 'export':
        this.onExportGlobal();
        break;
      case 'filter':
        this.onCloseDetail();
        this.filtreSelectionne = true;
        break;
    }
  }

  onCreatePreconisation(): void {
    if (this.isAdmin) {
      this.showCreateModal = true;
    }
  }

  onPreconisationCreated(): void {
    this.currentPage = 1;
    this.loadPreconisations(0);
  }

  onModifyClick(): void {
    if (this.isAdmin && this.selectedDetails) {
      this.showEditModal = true;
    }
  }

  onPreconisationUpdated(): void {
    this.showEditModal = false;
    this.onCloseDetail();
    this.loadPreconisations(this.page);
  }

  onDeleteClick(): void {
    if (!this.isAdmin || !this.selectedPreconisation || this.isDeleting) {
      return;
    }

    const preconisation = this.selectedPreconisation;
    const dialogRef = this.dialog.open(Modal, {
      width: 'min(500px, calc(100vw - 32px))',
      data: {
        title: 'Supprimer la préconisation',
        message: `Supprimer la préconisation « ${preconisation.libelle} » ?`,
        confirmText: 'Supprimer',
        confirmColor: 'warn',
        cancelText: 'Annuler',
        showCancel: true
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.deletePreconisation(preconisation.identifiant);
      }
    });
  }

  private deletePreconisation(identifiant: string): void {
    this.isDeleting = true;
    this.apiService.deletePreconisation(identifiant).subscribe({
      next: () => {
        this.isDeleting = false;
        this.snackBar.open('Préconisation supprimée avec succès', 'OK', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['snackbar-success']
        });
        this.onCloseDetail();
        this.loadPreconisations(this.page);
      },
      error: error => {
        console.error(error);
        this.isDeleting = false;
        this.snackBar.open('Erreur lors de la suppression de la préconisation', 'Fermer', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  onExportGlobal(): void {
    // L'export n'est pas encore exposé par le back. L'action reste affichée
    // pour conserver la navigation actuelle, sans inventer un endpoint.
  }

  onFiltreChange(filtre: FiltrePreconisationPayload): void {
    this.currentFilters = {
      libelle: filtre.libelle.trim()
    };
    this.currentPage = 1;
    this.loadPreconisations(0);
  }

  onFiltreClose(): void {
    this.filtreSelectionne = false;
  }

  onSortChange(sort: PreconisationSortEvent): void {
    this.sortField = sort.field;
    this.sortDirection = sort.direction;
    this.currentPage = 1;
    this.loadPreconisations(0);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPreconisations(page - 1);
    }
  }

  getPrioriteClass(priorite?: string): string {
    return prioriteClass(priorite);
  }

  getComplexiteClass(complexite?: string): string {
    return complexiteClass(complexite);
  }

  getAvancementClass(etatAvancement?: string): string {
    return avancementClass(etatAvancement);
  }

  getAvancementPercent(etatAvancement?: string): number | null {
    return parseAvancementPercent(etatAvancement);
  }

  value(value?: string | number | null): string {
    return displayValue(value);
  }

  scaleValue(value?: string | null): string {
    return scaleLabel(value);
  }

  traitementLie(details: PreconisationDetails | Preconisation): string {
    const nom = details.traitementNom;
    const idFonctionnel = 'traitementIdFonctionnel' in details
      ? details.traitementIdFonctionnel
      : undefined;
    if (idFonctionnel != null && nom) {
      return `${idFonctionnel} - ${nom}`;
    }
    return displayValue(nom);
  }

  explicationOf(details: PreconisationDetails | Preconisation): string | undefined {
    return 'explication' in details ? details.explication : undefined;
  }

  risqueOf(details: PreconisationDetails | Preconisation): string | undefined {
    return 'risqueEncours' in details ? details.risqueEncours : undefined;
  }

  contraintesOf(details: PreconisationDetails | Preconisation): string | undefined {
    return 'contraintes' in details ? details.contraintes : undefined;
  }

  coutOf(details: PreconisationDetails | Preconisation): string | undefined {
    return 'cout' in details ? details.cout : undefined;
  }

  commentaireOf(details: PreconisationDetails | Preconisation): string | undefined {
    return 'commentaire' in details
      ? splitPreconisationCommentaire(details.commentaire).commentaire
      : undefined;
  }

  historiqueModificationsOf(details: PreconisationDetails | Preconisation): string | undefined {
    return 'commentaire' in details
      ? splitPreconisationCommentaire(details.commentaire).historique
      : undefined;
  }

  private normalizeScales<T extends Preconisation>(item: T): T {
    const priorite = this.stripScale(item.priorite);
    const complexite = this.stripScale(item.complexite);
    return {
      ...item,
      priorite,
      prioriteLabel: this.stripScale(item.prioriteLabel) || priorite,
      complexite,
      complexiteLabel: this.stripScale(item.complexiteLabel) || complexite
    };
  }

  private stripScale(value?: string): string | undefined {
    if (!value) {
      return value;
    }
    const label = scaleLabel(value);
    return label === '—' ? value : label;
  }
}
