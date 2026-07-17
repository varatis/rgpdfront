import { Component } from '@angular/core';
import { HeaderAction } from '../../../../shared/components/header/header';
import { CommonModule } from '@angular/common';
import { MasterDetailLayout } from "../../../../layout/master-detail-layout/master-detail-layout";
import { PageTab, PageTabsComponent } from '../../../../shared/components/page-tabs/page-tab/page-tab';
import { DataTable } from "../../../../shared/components/data-table/data-table";
import { MatIconModule } from '@angular/material/icon';
interface Violation {
  id: string;
  date: Date;
  nature: string;
  dateReception: Date;
  statut: 'pending' | 'treated';
  description?: string;
}



interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}
@Component({
  selector: 'app-recueil-violation',
  imports: [CommonModule, MasterDetailLayout, PageTabsComponent, DataTable, MatIconModule],
  templateUrl: './recueil-violation.html',
  styleUrl: './recueil-violation.scss'
})
export class RecueilViolation {
     pageTitle = 'Recueil de violation';
  icon = 'error';

    actions: HeaderAction[] = [
    { label: 'Export global', icon: 'download', action: 'add', color: 'default' },
    { label: 'Filtres', icon: 'tune', action: 'filter', color: 'default' }
  ];


  tableColumns: TableColumn[] = [
    { key: 'date', label: 'DATE', sortable: true, width: '200px' },
    { key: 'nature', label: 'NATURE DE LA VIOLATION DCP', sortable: true, width: 'auto' },
    { key: 'dateReception', label: 'DATE DE RÉCEPTION', sortable: true, width: '200px' }
  ];

  detailTabs = ['Informations générales', 'Mesures prises', 'Documents'];
  activeDetailTab = 'Informations générales';

  activeTab: 'pending' | 'treated' = 'pending';
  selectedViolation: Violation | null = null;
  currentPage = 1;
  itemsPerPage = 10;

  violationsPending: Violation[] = [];
  get pageTabs(): PageTab[] {
    return [
      { key: 'pending', label: 'En cours de traitement', count: this.pendingCount },
      { key: 'treated', label: 'Traité', count: this.treatedCount }
    ];
  }

  violationsTreated: Violation[] = [];

  constructor() {}

  // Computed properties
  get displayedViolations(): any[] {
    const violations = this.activeTab === 'pending'
      ? this.violationsPending
      : this.violationsTreated;

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;


    return violations.slice(startIndex, endIndex).map(v => ({
      id: v.id,
      date: this.formatDate(v.date),
      nature: v.nature,
      dateReception: this.formatDate(v.dateReception),
      _raw: v
    }));
  }

  get pendingCount(): number {
    return this.violationsPending.length;
  }

  get treatedCount(): number {
    return this.violationsTreated.length;
  }

  get totalPages(): number {
    const total = this.activeTab === 'pending'
      ? this.violationsPending.length
      : this.violationsTreated.length;
    return Math.ceil(total / this.itemsPerPage);
  }

  // Méthodes
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR').format(date);
  }

 setActiveTab(key: string) {
    this.activeTab = key as 'pending' | 'treated';
    this.selectedViolation = null;
  }
  onCloseDetail() {
    this.selectedViolation = null;
  }
  onHeaderAction(action: string) {
    // Logique pour filtrer ou déclarer une violation
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onSelectViolation(item: any): void {
    // Récupère l'objet original depuis _raw
    this.selectedViolation = item._raw || item;
    this.activeDetailTab = 'Informations générales';
  }

  closeDetails(): void {
    this.selectedViolation = null;
  }

  onDetailTabChange(tab: string): void {
    this.activeDetailTab = tab;
  }

  onActionClick(action: string): void {
    switch(action) {
      case 'export':
        this.onExportGlobal();
        break;
      case 'filter':
        this.onFilterViolations();
        break;
    }
  }

  onExportGlobal(): void {}

  onFilterViolations(): void {}
}
