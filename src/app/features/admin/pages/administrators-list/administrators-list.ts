import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { MasterDetailLayout } from '../../../../layout/master-detail-layout/master-detail-layout';
import { HeaderAction } from '../../../../shared/components/header/header';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { ApiService } from '../../../../services/api.service';
import {
  Administrator,
  AdministratorRole
} from '../../../../shared/interfaces/administrator.interface';
import {
  FILTRE_ADMINISTRATEUR_VIDE,
  FiltreAdministrateurPayload
} from '../../../../core/models/filtre-administrateur.payload';
import { FiltreAdministrateur } from './filtre-administrateur/filtre-administrateur';
import { AdministrateurModal } from './administrateur-modal/administrateur-modal';

@Component({
  selector: 'app-administrators-list',
  standalone: true,
  imports: [
    CommonModule,
    MasterDetailLayout,
    MatIconModule,
    MatCheckboxModule,
    MatSnackBarModule,
    Pagination,
    FiltreAdministrateur,
    AdministrateurModal
  ],
  templateUrl: './administrators-list.html',
  styleUrl: './administrators-list.scss'
})
export class AdministratorsList implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  private readonly rolesEnAttente = new Set<string>();

  pageTitle = 'Administrateurs';
  pageIcon = 'admin_panel_settings';
  actions: HeaderAction[] = [
    {
      label: 'Ajouter un administrateur',
      icon: 'add',
      action: 'create',
      color: 'primary',
      testId: '_btn_ajouter_administrateur'
    },
    {
      label: 'Filtres',
      icon: 'tune',
      action: 'filter',
      color: 'default',
      testId: '_btn_filtres_administrateurs'
    }
  ];

  administrateurs: Administrator[] = [];
  isLoading = false;

  filtreSelectionne = false;
  currentFilters: FiltreAdministrateurPayload = { ...FILTRE_ADMINISTRATEUR_VIDE };

  currentPage = 1;
  readonly pageSize = 20;

  editionOuverte = false;
  adminAEditer: Administrator | null = null;
  suppressionId: string | null = null;

  get hasActiveFilters(): boolean {
    const filtres = this.currentFilters;

    return !!filtres.nom || !!filtres.prenom || !!filtres.client;
  }

  get administrateursFiltres(): Administrator[] {
    return this.appliquerFiltres(this.administrateurs);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.administrateursFiltres.length / this.pageSize));
  }

  get administrateursPage(): Administrator[] {
    const debut = (this.currentPage - 1) * this.pageSize;

    return this.administrateursFiltres.slice(debut, debut + this.pageSize);
  }

  get isDetailOpen(): boolean {
    return this.filtreSelectionne;
  }

  get detailTitle(): string {
    return 'Filtres';
  }

  get messageListeVide(): string {
    return this.hasActiveFilters
      ? 'Aucun administrateur ne correspond aux filtres.'
      : 'Aucun administrateur trouvé.';
  }

  ngOnInit(): void {
    this.chargerAdministrateurs();
  }

  estSuperAdmin(admin: Administrator): boolean {
    return admin.roles.includes('super-admin');
  }

  possedeRole(admin: Administrator, role: AdministratorRole): boolean {
    return admin.roles.includes(role);
  }

  rolesEnCours(id: string): boolean {
    return this.rolesEnAttente.has(id);
  }

  suppressionEnCours(id: string): boolean {
    return this.suppressionId === id;
  }

  onHeaderAction(action: string): void {
    switch (action) {
      case 'create':
        this.onCreateAdmin();
        break;
      case 'filter':
        this.onFilterAdmins();
        break;
    }
  }

  onCreateAdmin(): void {
    this.adminAEditer = null;
    this.editionOuverte = true;
  }

  onEditAdmin(admin: Administrator): void {
    this.adminAEditer = admin;
    this.editionOuverte = true;
  }

  onEditionFermee(): void {
    this.editionOuverte = false;
    this.adminAEditer = null;
  }

  onAdminEnregistre(_admin: Administrator): void {
    this.chargerAdministrateurs();
  }

  onFilterAdmins(): void {
    this.filtreSelectionne = true;
  }

  onFiltreChange(filtre: FiltreAdministrateurPayload): void {
    this.currentFilters = filtre;
    this.currentPage = 1;
    this.syncFilterAction();
  }

  onFiltreClose(): void {
    this.filtreSelectionne = false;
  }

  onCloseDetail(): void {
    this.filtreSelectionne = false;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onToggleRole(admin: Administrator, role: AdministratorRole, checked: boolean): void {
    const actuels = admin.roles;
    const suivants = checked
      ? (actuels.includes(role) ? actuels : [...actuels, role])
      : actuels.filter(actuel => actuel !== role);

    if (suivants.length === actuels.length && suivants.every(present => actuels.includes(present))) {
      return;
    }

    if (this.rolesEnAttente.has(admin.id)) {
      return;
    }

    const precedents = actuels;
    admin.roles = suivants;
    this.rolesEnAttente.add(admin.id);

    this.apiService
      .updateAdministrator(admin.id, { roles: suivants })
      .pipe(
        finalize(() => this.rolesEnAttente.delete(admin.id)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: misAJour => {
          admin.roles = misAJour?.roles ?? suivants;
          this.notifier('Rôles mis à jour avec succès', 'success');
        },
        error: () => {
          admin.roles = precedents;
          this.notifier('Erreur lors de la mise à jour des rôles', 'error');
        }
      });
  }

  onDeleteAdmin(admin: Administrator): void {
    if (this.suppressionId) {
      return;
    }

    if (!window.confirm(`Supprimer l\u2019administrateur ${admin.prenom} ${admin.nom} ?`)) {
      return;
    }

    this.suppressionId = admin.id;

    this.apiService
      .deleteAdministrator(admin.id)
      .pipe(
        finalize(() => (this.suppressionId = null)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.notifier('Administrateur supprimé avec succès', 'success');

          if (this.administrateursPage.length === 1 && this.currentPage > 1) {
            this.currentPage -= 1;
          }

          this.chargerAdministrateurs();
        },
        error: () => {
          this.notifier('Erreur lors de la suppression de l\u2019administrateur', 'error');
        }
      });
  }

  private chargerAdministrateurs(): void {
    this.isLoading = true;

    this.apiService
      .getAdministrators()
      .pipe(
        finalize(() => (this.isLoading = false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: administrateurs => {
          this.administrateurs = administrateurs ?? [];

          if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages;
          }
        },
        error: () => {
          this.administrateurs = [];
        }
      });
  }

  private syncFilterAction(): void {
    const filtre = this.actions.find(action => action.action === 'filter');

    if (filtre) {
      filtre.color = this.hasActiveFilters ? 'primary' : 'default';
    }
  }

  private appliquerFiltres(administrateurs: Administrator[]): Administrator[] {
    if (!this.hasActiveFilters) {
      return administrateurs;
    }

    const nom = this.normaliser(this.currentFilters.nom);
    const prenom = this.normaliser(this.currentFilters.prenom);
    const client = this.normaliser(this.currentFilters.client);

    return administrateurs.filter(admin => {
      if (nom && !this.normaliser(admin.nom).includes(nom)) {
        return false;
      }

      if (prenom && !this.normaliser(admin.prenom).includes(prenom)) {
        return false;
      }

      if (client && !this.normaliser(admin.clientNom).includes(client)) {
        return false;
      }

      return true;
    });
  }

  private normaliser(valeur?: string | null): string {
    return (valeur ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private notifier(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, type === 'success' ? 'OK' : 'Fermer', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [type === 'success' ? 'snackbar-success' : 'snackbar-error']
    });
  }
}
