import { Component } from '@angular/core';
import { TableColumn, DataTable } from '../../../../shared/components/data-table/data-table';
import { HeaderAction } from '../../../../shared/components/header/header';
import { MasterDetailLayout } from "../../../../layout/master-detail-layout/master-detail-layout";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
interface SousTraitant {
  id: string;
  nom: string;
  prestationFournie: string;
  adresseMail: string;
  telephone: string;
  contact: string;
  roleContact: string;
  traitementEffectue: string;
  donneesTraitees: string;
  contratAssocie: string;
  reference: string;
  commentaire: string;
  coordonnees: string;
}
@Component({
  selector: 'app-sous-traitant-dcp',
  standalone: true,
  imports: [CommonModule, MasterDetailLayout, DataTable],
  templateUrl: './sous-traitant-dcp.html',
  styleUrl: './sous-traitant-dcp.scss'
})
export class SousTraitantDcp {
  pageTitle = 'Sous-traitant DCP';
  icon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.6667 10.8333H15.8333V9.16667H11.6667V10.8333ZM11.6667 8.33334H15.8333V6.66667H11.6667V8.33334ZM4.16667 13.3333H10.8333V12.875C10.8333 12.25 10.5278 11.7535 9.91667 11.3854C9.30556 11.0174 8.50001 10.8333 7.50001 10.8333C6.50001 10.8333 5.69445 11.0174 5.08334 11.3854C4.47223 11.7535 4.16667 12.25 4.16667 12.875V13.3333ZM7.50001 10C7.95834 10 8.3507 9.83681 8.67709 9.51042C9.00348 9.18403 9.16667 8.79167 9.16667 8.33334C9.16667 7.875 9.00348 7.48264 8.67709 7.15625C8.3507 6.82986 7.95834 6.66667 7.50001 6.66667C7.04167 6.66667 6.64931 6.82986 6.32292 7.15625C5.99653 7.48264 5.83334 7.875 5.83334 8.33334C5.83334 8.79167 5.99653 9.18403 6.32292 9.51042C6.64931 9.83681 7.04167 10 7.50001 10ZM3.33334 16.6667C2.87501 16.6667 2.48264 16.5035 2.15626 16.1771C1.82987 15.8507 1.66667 15.4583 1.66667 15V5C1.66667 4.54167 1.82987 4.14931 2.15626 3.82292C2.48264 3.49653 2.87501 3.33334 3.33334 3.33334H16.6667C17.125 3.33334 17.5174 3.49653 17.8438 3.82292C18.1701 4.14931 18.3333 4.54167 18.3333 5V15C18.3333 15.4583 18.1701 15.8507 17.8438 16.1771C17.5174 16.5035 17.125 16.6667 16.6667 16.6667H3.33334ZM3.33334 15H16.6667V5H3.33334V15Z" fill="#161617"/>
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
    { key: 'nom', label: 'SOUS-TRAITANT', sortable: true, width: '200px' },
    { key: 'prestationFournie', label: 'PRESTATION FOURNIE', sortable: true, width: 'auto' },
    { key: 'adresseMail', label: 'ADRESSE MAIL', sortable: true, width: '250px' },
    { key: 'telephone', label: 'TÉLÉPHONE', sortable: true, width: '150px' }
  ];

  selectedSousTraitant: SousTraitant | null = null;
  currentPage = 1;
  itemsPerPage = 10;

  sousTraitants: SousTraitant[] = [];

  constructor(private router: Router) {}


  // Computed properties
  get displayedSousTraitants(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    return this.sousTraitants.slice(startIndex, endIndex).map(st => ({
      id: st.id,
      nom: st.nom,
      prestationFournie: st.prestationFournie,
      adresseMail: st.adresseMail,
      telephone: st.telephone,
      _raw: st
    }));
  }

  get totalPages(): number {
    return Math.ceil(this.sousTraitants.length / this.itemsPerPage);
  }

  // Méthodes
  onSelectSousTraitant(item: any): void {
    this.selectedSousTraitant = item._raw || item;
  }

  onCloseDetail(): void {
    this.selectedSousTraitant = null;
  }

  onHeaderAction(action: string): void {
    switch(action) {
      case 'export':
        this.onExportGlobal();
        break;
      case 'filter':
        this.onFilterSousTraitants();
        break;
    }
  }

  onExportGlobal(): void {}

  onFilterSousTraitants(): void {}

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
