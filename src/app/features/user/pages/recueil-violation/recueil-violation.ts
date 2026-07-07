import { Component } from '@angular/core';
import { HeaderAction } from '../../../../shared/components/header/header';
import { CommonModule } from '@angular/common';
import { MasterDetailLayout } from "../../../../layout/master-detail-layout/master-detail-layout";
import { PageTab, PageTabsComponent } from '../../../../shared/components/page-tabs/page-tab/page-tab';
import { DataTable } from "../../../../shared/components/data-table/data-table";
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
  imports: [CommonModule, MasterDetailLayout, PageTabsComponent, DataTable],
  templateUrl: './recueil-violation.html',
  styleUrl: './recueil-violation.scss'
})
export class RecueilViolation {
     pageTitle = 'Recueil de violation';
  icon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="#161617"/>
  </svg>`;

    actions: HeaderAction[] = [
    { label: 'Export global', icon: `<svg
                  class="icon"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 15L13 11L11.6 9.6L10 11.2V7H8V11.2L6.4 9.6L5 11L9 15ZM2 5V16H16V5H2ZM2 18C1.45 18 0.979167 17.8042 0.5875 17.4125C0.195833 17.0208 0 16.55 0 16V3.525C0 3.29167 0.0375 3.06667 0.1125 2.85C0.1875 2.63333 0.3 2.43333 0.45 2.25L1.7 0.725C1.88333 0.491667 2.1125 0.3125 2.3875 0.1875C2.6625 0.0625 2.95 0 3.25 0H14.75C15.05 0 15.3375 0.0625 15.6125 0.1875C15.8875 0.3125 16.1167 0.491667 16.3 0.725L17.55 2.25C17.7 2.43333 17.8125 2.63333 17.8875 2.85C17.9625 3.06667 18 3.29167 18 3.525V16C18 16.55 17.8042 17.0208 17.4125 17.4125C17.0208 17.8042 16.55 18 16 18H2ZM2.4 3H15.6L14.75 2H3.25L2.4 3Z"
                  />
                </svg>`, action: 'add', color: 'default' },{
      label: 'Filtres',
      icon: `
    <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 12V10H11V12H7ZM3 7V5H15V7H3ZM0 2V0H18V2H0Z" fill="currentColor" />
      </svg>
  `,
      action: 'filter',
      color: 'default',
    }
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
