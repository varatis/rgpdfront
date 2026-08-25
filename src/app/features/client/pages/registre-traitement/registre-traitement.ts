import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header, HeaderAction } from '../../../../shared/components/header/header';
import { TableTraitement, SortColumn, SortDirection, SortEvent } from './table-traitement/table-traitement';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { DetailsTraitementComponent } from './details-traitement/details-traitement';
import { CreateTraitementModal } from './create-traitement-modal/create-traitement-modal';
import { ApiService } from '../../../../services/api.service';
import { KeycloakService } from '../../../../core/auth/keycloak.service';
import { Traitement, TraitementDetails } from '../../../../core/models/traitement.model';
import { FiltreTraitement } from './filtre-traitement/filtre-traitement';
import { MatIconModule } from '@angular/material/icon';
import { FiltreTraitementPayload } from '../../../../core/models/filtre-traitement.payload';
import { Subject } from 'rxjs';
import { debounceTime, switchMap, finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageResponse } from '../../../../core/models/page-response.model';

@Component({
  selector: 'app-registre-traitement',
  standalone: true,
  imports: [CommonModule, Header, TableTraitement, Pagination, DetailsTraitementComponent, CreateTraitementModal, MatIconModule, FiltreTraitement],
  templateUrl: './registre-traitement.html',
  styleUrl: './registre-traitement.scss',
})
export class RegistreTraitement implements OnInit {
  private apiService = inject(ApiService);
  private keycloakService = inject(KeycloakService);
  private destroyRef = inject(DestroyRef);
  private load$ = new Subject<number>();

  title = 'Registre des activités de traitement';
  icon = `
    <svg viewBox="0 0 28 28" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 25.6667C6.02778 25.6667 5.20139 25.3264 4.52083 24.6458C3.84028 23.9653 3.5 23.1389 3.5 22.1667V18.6667H7V2.33333H24.5V22.1667C24.5 23.1389 24.1597 23.9653 23.4792 24.6458C22.7986 25.3264 21.9722 25.6667 21 25.6667H7ZM21 23.3333C21.3306 23.3333 21.6076 23.2215 21.8312 22.9979C22.0549 22.7743 22.1667 22.4972 22.1667 22.1667V4.66666H9.33333V18.6667H19.8333V22.1667C19.8333 22.4972 19.9451 22.7743 20.1688 22.9979C20.3924 23.2215 20.6694 23.3333 21 23.3333ZM10.5 10.5V8.16666H21V10.5H10.5ZM10.5 14V11.6667H21V14H10.5ZM7 23.3333H17.5V21H5.83333V22.1667C5.83333 22.4972 5.94514 22.7743 6.16875 22.9979C6.39236 23.2215 6.66944 23.3333 7 23.3333Z" fill="currentColor"/>
    </svg>
  `;

  private readonly filterAction: HeaderAction = {
    label: 'Filtres',
    icon: `
    <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 12V10H11V12H7ZM3 7V5H15V7H3ZM0 2V0H18V2H0Z" fill="currentColor" />
      </svg>
  `,
    action: 'filter',
    color: 'default',
  };

  private readonly addAction: HeaderAction = {
    label: 'Ajouter un traitement', action: 'add', color: 'primary'
  };

  get isAdmin(): boolean {
    return this.keycloakService.getUserRole() === 'admin';
  }

  get actions(): HeaderAction[] {
    return this.isAdmin
      ? [this.filterAction, this.addAction]
      : [this.filterAction];
  }

  currentPage = 1;
  traitementSelectionne?: Traitement;
  filtreSelectionne = false;
  currentFilters: FiltreTraitementPayload = {
    traitement: '',
    gestionnaire: '',
    finalitePrincipale: ''
  };
  data: Traitement[] = [];
  page = 0;
  size = 10;
  totalElements = 0;
  totalPages = 0;
  sortField: SortColumn = null;
  sortDirection: SortDirection = 'asc';
  loading = false;
  showCreateModal = false;
  showEditModal = false;
  currentTraitementDetails: TraitementDetails | undefined;

  ngOnInit(): void {
    this.load$.pipe(
      debounceTime(150),
      switchMap(page => {
        this.loading = true;
        const clientNameArg = this.keycloakService.getClientName();
        const safeClientName = (clientNameArg === null) ? undefined : clientNameArg;
        const safeSortField = this.sortField ?? 'idFonctionnel';

        return this.apiService.getTraitements(
          page,
          this.size,
          safeSortField,
          this.sortDirection,
          safeClientName,
          this.currentFilters
        ).pipe(
          finalize(() => this.loading = false)
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (res: PageResponse<Traitement>) => {
        this.data = res.content;
        this.page = res.number;
        this.currentPage = res.number + 1;
        this.size = res.size;
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
      },
      error: (err) => {
        console.error(err);
      }
    });

    this.loadTraitements(0);
  }

  loadTraitements(page: number): void {
    // Toutes les requêtes passent par le même flux afin de ne jamais perdre les
    // filtres lors d'un changement de page ou du premier chargement.
    this.load$.next(page);
  }


  onActionClick(action: string) {
    if (action === 'add') {
      this.showCreateModal = true;
    } else if (action === 'filter') {
      this.closeDetail();
      this.filtreSelectionne = true;
    }
  }

  onSelectTraitement(item: Traitement) {
    this.traitementSelectionne = this.traitementSelectionne?.idFonctionnel === item.idFonctionnel ? undefined : item;
  }

  onTraitementCreated() {
    this.currentPage = 1;
    this.loadTraitements(0);
  }

  onSortChange(sort: SortEvent) {
    if (sort.field) {
      this.sortField = sort.field;
      this.sortDirection = sort.direction;
      this.currentPage = 1;
      this.loadTraitements(0);
    }
  }

  onFiltreChange(filtre: FiltreTraitementPayload) {
    this.currentFilters = {
      traitement: filtre.traitement.trim(),
      gestionnaire: filtre.gestionnaire.trim(),
      finalitePrincipale: filtre.finalitePrincipale.trim()
    };
    this.currentPage = 1;
    this.loadTraitements(0);
  }

  onFiltreClose() {
    this.filtreSelectionne = false;
  }

  onPageChange(page: number) {
    this.currentPage = page;
    if (page > 0) {
      this.loadTraitements(page - 1);
    }
  }

  onDetailsLoaded(details: TraitementDetails): void {
    this.currentTraitementDetails = details;
  }

  onModifyClick(): void {
    if (!this.isAdmin) {
      return;
    }

    this.showEditModal = true;
  }

  onTraitementUpdated(): void {
    this.loadTraitements(this.page);
  }

  onDeleteClick(): void {
    if (!this.isAdmin || !this.traitementSelectionne) {
      return;
    }

    const confirmed = window.confirm(
      `Supprimer le traitement ${this.traitementSelectionne.idFonctionnel} ?`
    );

    if (!confirmed) {
      return;
    }

    this.apiService.deleteTraitement(this.traitementSelectionne.identifiant)
      .subscribe({
        next: () => {
          this.closeDetail();
          this.loadTraitements(this.page);
        },
        error: (err) => console.error(err)
      });
  }

  closeDetail() {
    this.traitementSelectionne = undefined;
    this.currentTraitementDetails = undefined;
  }
}
