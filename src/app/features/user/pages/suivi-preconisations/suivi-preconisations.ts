import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { HeaderAction } from '../../../../shared/components/header/header';
import { MasterDetailLayout } from '../../../../layout/master-detail-layout/master-detail-layout';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { PreconisationsTable, PreconisationSortEvent } from '../../../../shared/components/preconisations-table/preconisations-table';
import { FiltrePreconisation } from './filtre-preconisation/filtre-preconisation';
import { ApiService } from '../../../../services/api.service';
import { KeycloakService } from '../../../../core/auth/keycloak.service';
import {
  avancementClass,
  complexiteClass,
  displayValue,
  parseAvancementPercent,
  Preconisation,
  PreconisationDetails,
  PreconisationSortField,
  prioriteClass
} from '../../../../core/models/preconisation.model';
import { FiltrePreconisationPayload } from '../../../../core/models/filtre-preconisation.payload';
import { PageResponse } from '../../../../core/models/page-response.model';

@Component({
  selector: 'app-suivi-preconisations',
  standalone: true,
  imports: [CommonModule, MasterDetailLayout, Pagination, PreconisationsTable, FiltrePreconisation],
  templateUrl: './suivi-preconisations.html',
  styleUrl: './suivi-preconisations.scss'
})
export class SuiviPreconisations implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly keycloakService = inject(KeycloakService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly load$ = new Subject<number>();
  private readonly details$ = new Subject<string>();
  pageTitle = 'Suivi des préconisations';
  icon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.58329 10.7084L14.2916 6.00008L13.125 4.79175L9.58329 8.33342L7.79163 6.58342L6.62496 7.75008L9.58329 10.7084ZM5.66663 14.0001C5.20829 14.0001 4.81593 13.8369 4.48954 13.5105C4.16315 13.1841 3.99996 12.7917 3.99996 12.3334V2.33341C3.99996 1.87508 4.16315 1.48272 4.48954 1.15633C4.81593 0.829943 5.20829 0.666748 5.66663 0.666748H15.6666C16.125 0.666748 16.5173 0.829943 16.8437 1.15633C17.1701 1.48272 17.3333 1.87508 17.3333 2.33341V12.3334C17.3333 12.7917 17.1701 13.1841 16.8437 13.5105C16.5173 13.8369 16.125 14.0001 15.6666 14.0001H5.66663ZM5.66663 12.3334H15.6666V2.33341H5.66663V12.3334ZM2.33329 17.3334C1.87496 17.3334 1.4826 17.1702 1.15621 16.8438C0.82982 16.5174 0.666626 16.1251 0.666626 15.6667V4.00008H2.33329V15.6667H14V17.3334H2.33329Z" fill="#161617"/>
  </svg>`;

  actions: HeaderAction[] = [
    {
      label: 'Export global',
      icon: `<svg class="icon" width="18" height="18" viewBox="0 0 18 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 15L13 11L11.6 9.6L10 11.2V7H8V11.2L6.4 9.6L5 11L9 15ZM2 5V16H16V5H2ZM2 18C1.45 18 0.979167 17.8042 0.5875 17.4125C0.195833 17.0208 0 16.55 0 16V3.525C0 3.29167 0.0375 3.06667 0.1125 2.85C0.1875 2.63333 0.3 2.43333 0.45 2.25L1.7 0.725C1.88333 0.491667 2.1125 0.3125 2.3875 0.1875C2.6625 0.0625 2.95 0 3.25 0H14.75C15.05 0 15.3375 0.0625 15.6125 0.1875C15.8875 0.3125 16.1167 0.491667 16.3 0.725L17.55 2.25C17.7 2.43333 17.8125 2.63333 17.8875 2.85C17.9625 3.06667 18 3.29167 18 3.525V16C18 16.55 17.8042 17.0208 17.4125 17.4125C17.0208 17.8042 16.55 18 16 18H2ZM2.4 3H15.6L14.75 2H3.25L2.4 3Z"/>
      </svg>`,
      action: 'export',
      color: 'default'
    },
    {
      label: 'Filtres',
      icon: `<svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 12V10H11V12H7ZM3 7V5H15V7H3ZM0 2V0H18V2H0Z" fill="currentColor"/>
      </svg>`,
      action: 'filter',
      color: 'default'
    }
  ];

  data: Preconisation[] = [];

  selectedPreconisation: Preconisation | null = null;
  selectedDetails: PreconisationDetails | null = null;
  filtreSelectionne = false;
  currentFilters: FiltrePreconisationPayload = {
    libelle: '',
    etatAvancement: ''
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
    return this.filtreSelectionne || !!this.selectedPreconisation;
  }

  get detailTitle(): string {
    if (this.filtreSelectionne) {
      return 'Filtres';
    }
    return this.selectedDetails?.libelle
      || this.selectedPreconisation?.libelle
      || 'Détails';
  }

  // Computed properties
  get displayedDetails(): PreconisationDetails | Preconisation | null {
    return this.selectedDetails ?? this.selectedPreconisation;
  }

  get detailView(): PreconisationDetails | Preconisation | null {
    if (this.filtreSelectionne) {
      return null;
    }
    return this.displayedDetails;
  }

  ngOnInit(): void {
    this.load$.pipe(
      switchMap((page) => {
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
          catchError((err) => {
            console.error(err);
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
    ).subscribe((res: PageResponse<Preconisation>) => {
      this.data = res.content ?? [];
      this.page = res.number;
      this.size = res.size;
      this.totalElements = res.totalElements;
      this.totalPages = res.totalPages;
      this.currentPage = res.number + 1;
    });

    this.details$.pipe(
      switchMap((identifiant) => {
        this.detailsLoading = true;
        return this.apiService.getPreconisationDetails(identifiant).pipe(
          catchError((err) => {
            console.error(err);
            return EMPTY;
          }),
          finalize(() => this.detailsLoading = false)
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((details) => {
      if (this.selectedPreconisation?.identifiant === details.identifiant) {
        this.selectedDetails = details;
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
      case 'export':
        this.onExportGlobal();
        break;
      case 'filter':
        this.selectedPreconisation = null;
        this.selectedDetails = null;
        this.filtreSelectionne = true;
        break;
    }
  }

  onExportGlobal(): void {}

  onFiltreChange(filtre: FiltrePreconisationPayload): void {
    this.currentFilters = filtre;
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
    return 'commentaire' in details ? details.commentaire : undefined;
  }
}
