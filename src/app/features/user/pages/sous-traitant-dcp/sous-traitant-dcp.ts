import { Component } from '@angular/core';
import { TableColumn, DataTable } from '../../../../shared/components/data-table/data-table';
import { HeaderAction } from '../../../../shared/components/header/header';
import { MasterDetailLayout } from "../../../../layout/master-detail-layout/master-detail-layout";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
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
  imports: [CommonModule, MasterDetailLayout, DataTable, MatIconModule],
  templateUrl: './sous-traitant-dcp.html',
  styleUrl: './sous-traitant-dcp.scss'
})
export class SousTraitantDcp {
  pageTitle = 'Sous-traitant DCP';
  icon = 'people';

  actions: HeaderAction[] = [
    { label: 'Export global', icon: 'download', action: 'export', color: 'default' },
    { label: 'Filtres', icon: 'tune', action: 'filter', color: 'default' }
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
