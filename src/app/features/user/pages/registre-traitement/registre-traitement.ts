import { Component } from '@angular/core';
  import { Header, HeaderAction } from '../../../../shared/components/header/header';

import { TableItem, Table } from '../../../../shared/components/table/table';

import { Pagination } from "../../../../shared/components/pagination/pagination";
import { TreatmentTabsComponent } from "../../../../shared/components/tabs/treatmentTabs";
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-registre-traitement',
  imports: [Header, Table, Pagination, TreatmentTabsComponent, MatIconModule],
  templateUrl: './registre-traitement.html',
  styleUrl: './registre-traitement.scss'
})
export class RegistreTraitement {
  title = 'Registre des activités de traitement';
  icon = 'library_books';

  actions: HeaderAction[] = [
    { label: 'Export global', icon: 'download', action: 'add', color: 'default' },
    { label: 'Filtres', icon: 'tune', action: 'filter', color: 'default' }
  ];

  currentPage = 2;
  totalPages = 7;
  selectedTreatment?: TableItem;

  data: TableItem[] = [
    {
      id: 1,
      treatment: 'Pré inscription',
      manager: 'Chefs de service et directeurs & psychologue',
      purpose:
        "Collecter les informations personnelles permettant d'inscrire les demandeurs sur liste d'attente.",
    },
    {
      id: 2,
      treatment: 'Admission',
      manager: 'Chefs de service et directeurs',
      purpose:
        "Collecter les informations personnelles permettant d'enregistrer administrativement le nouvel usager",
    },
    {
      id: 3,
      treatment: 'Admission',
      manager: 'Chefs de service et directeurs',
      purpose:
        "Collecter les informations personnelles permettant d'enregistrer administrativement le nouvel usager",
    },
    {
      id: 4,
      treatment: 'Admission',
      manager: 'Chefs de service et directeurs',
      purpose:
        "Collecter les informations personnelles permettant d'enregistrer administrativement le nouvel usager",
    },
    {
      id: 5,
      treatment: 'Admission',
      manager: 'Chefs de service et directeurs',
      purpose:
        "Collecter les informations personnelles permettant d'enregistrer administrativement le nouvel usager",
    },
    {
      id: 6,
      treatment: 'Admission',
      manager: 'Secrétaire',
      purpose:
        "Collecter les informations personnelles permettant d'enregistrer administrativement le nouvel usager",
    },
    {
      id: 7,
      treatment: 'Admission',
      manager: 'Chefs de service et directeurs',
      purpose:
        "Collecter les informations personnelles permettant d'enregistrer administrativement le nouvel usager",
    },
    {
      id: 8,
      treatment: 'Admission',
      manager: 'Chefs de service et directeurs',
      purpose:
        "Collecter les informations personnelles permettant d'enregistrer administrativement le nouvel usager",
    },
    {
      id: 9,
      treatment: 'Admission',
      manager: 'Chefs de service et directeurs',
      purpose:
        "Collecter les informations personnelles permettant d'enregistrer administrativement le nouvel usager",
    },
    {
      id: 10,
      treatment: 'Accompagnement des usagers - Partie non médicale',
      manager: 'Chef de service',
      purpose:
        "Collecter et utiliser des données permettant de construire le projet d'accompagnement personnalisé des usagers et d'organiser et tracer l'accompagnement à apporter",
    },
  ];

  onActionClick(action: string) {
    if (action === 'export') {
      // Export logic
    } else if (action === 'filter') {
      // Filter logic
    }
  }

  onSelectTreatment(item: TableItem) {
    if (this.selectedTreatment?.id === item.id) {
      this.selectedTreatment = undefined;
    } else {
      this.selectedTreatment = item;
    }
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  closeDetail() {
    this.selectedTreatment = undefined;
  }

}
