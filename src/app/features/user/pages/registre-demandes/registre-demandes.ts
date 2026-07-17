import { Component } from '@angular/core';
import { PageTab, PageTabsComponent } from '../../../../shared/components/page-tabs/page-tab/page-tab';
import { TableColumn, DataTable } from '../../../../shared/components/data-table/data-table';
import { HeaderAction } from '../../../../shared/components/header/header';
import { MasterDetailLayout } from "../../../../layout/master-detail-layout/master-detail-layout";
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
interface Demande {
  id: string;
  typeDemande: string;
  descriptionSynthetique: string;
  dateReception: Date;
  origine: string;
  servicesConcernes: string;
  detailTraitement: string;
  servicesImpliques: string;
  reponse: string;
  alerteRT: string;
  statut: 'treated' | 'pending';
}
@Component({
  selector: 'app-registre-demandes',
  standalone: true,
  imports: [CommonModule,MasterDetailLayout, PageTabsComponent, DataTable, MatIconModule],
  templateUrl: './registre-demandes.html',
  styleUrl: './registre-demandes.scss'
})
export class RegistreDemandes {
  pageTitle = 'Registre des demandes';
  icon = 'contact_support';

  actions: HeaderAction[] = [
    { label: 'Export global', icon: 'download', action: 'export', color: 'default' },
    { label: 'Filtres', icon: 'tune', action: 'filter', color: 'default' }
  ];

  tableColumns: TableColumn[] = [
    { key: 'typeDemande', label: 'TYPE DE DEMANDE', sortable: true, width: '200px' },
    { key: 'descriptionSynthetique', label: 'DESCRIPTION SYNTHÉTIQUE', sortable: true, width: 'auto' },
    { key: 'dateReception', label: 'DATE DE RÉCEPTION', sortable: true, width: '200px' }
  ];

  activeTab: 'pending' | 'treated' = 'pending';
  selectedDemande: Demande | null = null;
  currentPage = 1;
  itemsPerPage = 10;

  demandesPending: Demande[] = [];

  demandesTreated: Demande[] = [];

  constructor() {}

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
      typeDemande: d.typeDemande,
      descriptionSynthetique: d.descriptionSynthetique,
      dateReception: this.formatDate(d.dateReception),
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

  // Méthodes
  formatDate(date: any): string {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
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
}
