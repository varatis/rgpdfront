import { Component } from '@angular/core';
import { PageTab, PageTabsComponent } from '../../../../shared/components/page-tabs/page-tab/page-tab';
import { TableColumn, DataTable } from '../../../../shared/components/data-table/data-table';
import { HeaderAction } from '../../../../shared/components/header/header';
import { MasterDetailLayout } from "../../../../layout/master-detail-layout/master-detail-layout";
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule,MasterDetailLayout, PageTabsComponent, DataTable],
  templateUrl: './registre-demandes.html',
  styleUrl: './registre-demandes.scss'
})
export class RegistreDemandes {
  pageTitle = 'Registre des demandes';
  icon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.95834 15C10.25 15 10.4965 14.8993 10.6979 14.6979C10.8993 14.4965 11 14.25 11 13.9583C11 13.6667 10.8993 13.4201 10.6979 13.2188C10.4965 13.0174 10.25 12.9167 9.95834 12.9167C9.66667 12.9167 9.42014 13.0174 9.21876 13.2188C9.01737 13.4201 8.91667 13.6667 8.91667 13.9583C8.91667 14.25 9.01737 14.4965 9.21876 14.6979C9.42014 14.8993 9.66667 15 9.95834 15ZM9.20834 11.7917H10.75C10.75 11.3333 10.8021 10.9722 10.9063 10.7083C11.0104 10.4444 11.3056 10.0833 11.7917 9.625C12.1528 9.26389 12.4375 8.92014 12.6458 8.59375C12.8542 8.26736 12.9583 7.875 12.9583 7.41667C12.9583 6.63889 12.6736 6.04167 12.1042 5.625C11.5347 5.20833 10.8611 5 10.0833 5C9.29167 5 8.64931 5.20833 8.15626 5.625C7.6632 6.04167 7.31945 6.54167 7.12501 7.125L8.50001 7.66667C8.56945 7.41667 8.7257 7.14583 8.96876 6.85417C9.21181 6.5625 9.58334 6.41667 10.0833 6.41667C10.5278 6.41667 10.8611 6.5382 11.0833 6.78125C11.3056 7.02431 11.4167 7.29167 11.4167 7.58333C11.4167 7.86111 11.3333 8.12153 11.1667 8.36459C11 8.60764 10.7917 8.83334 10.5417 9.04167C9.93056 9.58334 9.55556 9.99306 9.41667 10.2708C9.27778 10.5486 9.20834 11.0556 9.20834 11.7917ZM10 18.3333C8.84723 18.3333 7.76389 18.1146 6.75001 17.6771C5.73612 17.2396 4.85417 16.6458 4.10417 15.8958C3.35417 15.1458 2.76042 14.2639 2.32292 13.25C1.88542 12.2361 1.66667 11.1528 1.66667 10C1.66667 8.84722 1.88542 7.76389 2.32292 6.75C2.76042 5.73611 3.35417 4.85417 4.10417 4.10417C4.85417 3.35417 5.73612 2.76042 6.75001 2.32292C7.76389 1.88542 8.84723 1.66667 10 1.66667C11.1528 1.66667 12.2361 1.88542 13.25 2.32292C14.2639 2.76042 15.1458 3.35417 15.8958 4.10417C16.6458 4.85417 17.2396 5.73611 17.6771 6.75C18.1146 7.76389 18.3333 8.84722 18.3333 10C18.3333 11.1528 18.1146 12.2361 17.6771 13.25C17.2396 14.2639 16.6458 15.1458 15.8958 15.8958C15.1458 16.6458 14.2639 17.2396 13.25 17.6771C12.2361 18.1146 11.1528 18.3333 10 18.3333ZM10 16.6667C11.8611 16.6667 13.4375 16.0208 14.7292 14.7292C16.0208 13.4375 16.6667 11.8611 16.6667 10C16.6667 8.13889 16.0208 6.5625 14.7292 5.27083C13.4375 3.97917 11.8611 3.33333 10 3.33333C8.13889 3.33333 6.56251 3.97917 5.27084 5.27083C3.97917 6.5625 3.33334 8.13889 3.33334 10C3.33334 11.8611 3.97917 13.4375 5.27084 14.7292C6.56251 16.0208 8.13889 16.6667 10 16.6667Z" fill="#161617"/>
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

  tableColumns: TableColumn[] = [
    { key: 'typeDemande', label: 'TYPE DE DEMANDE', sortable: true, width: '200px' },
    { key: 'descriptionSynthetique', label: 'DESCRIPTION SYNTHÉTIQUE', sortable: true, width: 'auto' },
    { key: 'dateReception', label: 'DATE DE RÉCEPTION', sortable: true, width: '200px' }
  ];

  activeTab: 'pending' | 'treated' = 'pending';
  selectedDemande: Demande | null = null;
  currentPage = 1;
  itemsPerPage = 10;

  demandesPending: Demande[] = [
    {
      id: 'D001',
      typeDemande: 'Accès (Consultation)',
      descriptionSynthetique: 'Consulter son dossier personnel papier',
      dateReception: new Date('2024-09-21'),
      origine: 'Mail',
      servicesConcernes: 'Service RH',
      detailTraitement: '-',
      servicesImpliques: 'Service RH',
      reponse: '26/09',
      alerteRT: '-',
      statut: 'pending'
    },
    {
      id: 'D002',
      typeDemande: 'Accès (Consultation)',
      descriptionSynthetique: 'Consulter son dossier personnel papier',
      dateReception: new Date('2024-09-21'),
      origine: 'Mail',
      servicesConcernes: 'Service RH',
      detailTraitement: '-',
      servicesImpliques: 'Service RH',
      reponse: '26/09',
      alerteRT: '-',
      statut: 'pending'
    }
  ];

  demandesTreated: Demande[] = [
    {
      id: 'D101',
      typeDemande: 'Rectification',
      descriptionSynthetique: 'Modification adresse personnelle',
      dateReception: new Date('2024-08-15'),
      origine: 'Courrier',
      servicesConcernes: 'Service RH',
      detailTraitement: 'Adresse mise à jour dans le système',
      servicesImpliques: 'Service RH, IT',
      reponse: '20/08',
      alerteRT: 'Non',
      statut: 'treated'
    }
  ];

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
