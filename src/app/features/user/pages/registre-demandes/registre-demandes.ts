
import { PageTab, PageTabsComponent } from '../../../../shared/components/page-tabs/page-tab/page-tab';
import { TableColumn, DataTable } from '../../../../shared/components/data-table/data-table';
import { HeaderAction } from '../../../../shared/components/header/header';
import { MasterDetailLayout } from "../../../../layout/master-detail-layout/master-detail-layout";
import { CommonModule } from '@angular/common';
import {CreateDemandeModal} from './create-demande-modal/create-demande-modal';
import {ApiService} from '../../../../services/api.service';
import { Component, OnInit } from '@angular/core';
import { Demande } from '../../../../core/models/demande.model';
import { displayValue } from '../../../../core/models/preconisation.model';
import { KeycloakService } from '../../../../core/auth/keycloak.service';


@Component({
  selector: 'app-registre-demandes',
  standalone: true,
  imports: [CommonModule,MasterDetailLayout, PageTabsComponent, DataTable, CreateDemandeModal],
  templateUrl: './registre-demandes.html',
  styleUrl: './registre-demandes.scss'
})
export class RegistreDemandes implements OnInit{
  pageTitle = 'Registre des demandes';
  icon = 'help_outline';

  actions: HeaderAction[] = [
    {
      // Pas d'icône : le libellé suffit à porter l'action d'ajout.
      label: 'Ajouter une demande',
      action: 'add',
      color: 'primary'
    },
    {
      label: 'Import',
      icon: 'upload_file',
      action: 'import',
      color: 'primary'
    },
    {
      label: 'Export global',
      icon: 'download',
      action: 'export',
      color: 'default'
    },
    {
      label: 'Filtres',
      icon: 'filter_list',
      action: 'filter',
      color: 'default'
    }
  ];

  tableColumns: TableColumn[] = [
    { key: 'typeDemande', label: 'TYPE DE DEMANDE', sortable: true, width: '200px' },
    { key: 'descriptionSynthetique', label: 'DESCRIPTION SYNTHÉTIQUE', sortable: true, width: 'auto' },
    { key: 'dateReception', label: 'DATE DE RÉCEPTION', sortable: true, width: '200px' }
  ];

  activeTab: 'pending' | 'treated' = 'pending';
  selectedDemande: Demande | null = null;
  showCreateDemandeModal = false;
  /** Évite double-clic sur « Valider la demande » pendant l'appel au back. */
  isValidating = false;
  currentPage = 1;
  itemsPerPage = 10;

  demandesPending: Demande[] = [];

  demandesTreated: Demande[] = [];

  constructor(
    private apiService: ApiService,
    private keycloakService: KeycloakService
  ) {

    // this.demandesPending = [...];
    // this.demandesTreated = [...];

  }



  // Computed properties
  get pageTabs(): PageTab[] {
    return [
      { key: 'pending', label: 'Demandes non traitées', count: this.pendingCount },
      { key: 'treated', label: 'Demandes traitées', count: this.treatedCount }
    ];
  }

  get displayedDemandes(): any[] {
    const demandes = this.activeTab === 'pending'
      ? this.demandesPending
      : this.demandesTreated;

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    return demandes.slice(startIndex, endIndex).map(d => ({
      id: d.id,
      typeDemande: this.value(d.typeDemande),
      descriptionSynthetique: this.value(d.descriptionSynthetique),
      dateReception: this.value(this.formatDate(d.dateReception)),
      _raw: d
    }));
  }

  get pendingCount(): number {
    return this.demandesPending.length;
  }

  get treatedCount(): number {
    return this.demandesTreated.length;
  }

  get totalPages(): number {
    const total = this.activeTab === 'pending'
      ? this.demandesPending.length
      : this.demandesTreated.length;
    return Math.ceil(total / this.itemsPerPage);
  }

  ngOnInit(): void {
  this.loadDemandes()
  }

  loadDemandes(): void {

    this.apiService.getDemandes()
      .subscribe({

        next: demandes => {

          this.demandesPending =
            demandes.filter(
              d => d.statut === 'EN_ATTENTE'
            );

          this.demandesTreated =
            demandes.filter(
              d => d.statut === 'TRAITEE'
            );

        },

        error: err => {
          console.error(err);
        }

      });

  }
  // Méthodes
  /** Valeur vide affichée en « — », comme dans le suivi des préconisations. */
  value(value?: string | number | null): string {
    return displayValue(value);
  }

  /**
   * Date de réception libellée. Une date absente ou mal formée rend une chaîne
   * vide : le `value()` du modèle affiche alors « — » et la page ne plante plus
   * sur un `Intl.DateTimeFormat.format(Invalid Date)`.
   */
  formatDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(parsedDate.getTime())) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long'
  }).format(parsedDate);
}


  setActiveTab(key: string): void {
    this.activeTab = key as 'pending' | 'treated';
    this.selectedDemande = null;
    this.currentPage = 1;
  }

  onSelectDemande(item: any): void {
    this.selectedDemande = item._raw || item;
  }

  onCloseDetail(): void {
    this.selectedDemande = null;
  }

  onHeaderAction(action: string): void {
    switch(action) {

      case 'add':
        this.showCreateDemandeModal = true;
        break;

      case 'import':
        this.onImportDemandes();
        break;

      case 'export':
        this.onExportGlobal();
        break;

      case 'filter':
        this.onFilterDemandes();
        break;
    }
  }

  onExportGlobal(): void {}

  onFilterDemandes(): void {}

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  private onImportDemandes() {
    console.log('Import Excel')
  }

  onDemandeCreated(): void {
    this.loadDemandes();
  }

  get isAdmin(): boolean {

    const role = this.keycloakService.getUserRole();

    return role === 'admin'
      || role === 'superadmin';
  }

  validerDemande(): void {

    if (!this.selectedDemande || this.isValidating) {
      return;
    }

    this.isValidating = true;

    this.apiService
      .traiterDemande(this.selectedDemande.id)
      .subscribe({

        next: () => {

          this.isValidating = false;

          this.selectedDemande = null;

          this.loadDemandes();

        },

        error: err => {
          console.error(err);
          this.isValidating = false;
        }

      });

  }
}
