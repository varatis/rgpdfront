import { Component, OnInit } from '@angular/core';
  import { Header, HeaderAction } from '../../../../shared/components/header/header';

import { TableItem, Table } from '../../../../shared/components/table/table';

import { Pagination } from "../../../../shared/components/pagination/pagination";
import { Tabs } from "../../../../shared/components/tabs/tabs";

@Component({
  selector: 'app-registre-traitement',
  imports: [Header, Table, Pagination, Tabs],
  templateUrl: './registre-traitement.html',
  styleUrl: './registre-traitement.scss'
})
export class RegistreTraitement implements OnInit {
  ngOnInit() {}
  title = 'Registre des activités de traitement';
  icon = `
    <svg viewBox="0 0 28 28" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 25.6667C6.02778 25.6667 5.20139 25.3264 4.52083 24.6458C3.84028 23.9653 3.5 23.1389 3.5 22.1667V18.6667H7V2.33333H24.5V22.1667C24.5 23.1389 24.1597 23.9653 23.4792 24.6458C22.7986 25.3264 21.9722 25.6667 21 25.6667H7ZM21 23.3333C21.3306 23.3333 21.6076 23.2215 21.8312 22.9979C22.0549 22.7743 22.1667 22.4972 22.1667 22.1667V4.66666H9.33333V18.6667H19.8333V22.1667C19.8333 22.4972 19.9451 22.7743 20.1688 22.9979C20.3924 23.2215 20.6694 23.3333 21 23.3333ZM10.5 10.5V8.16666H21V10.5H10.5ZM10.5 14V11.6667H21V14H10.5ZM7 23.3333H17.5V21H5.83333V22.1667C5.83333 22.4972 5.94514 22.7743 6.16875 22.9979C6.39236 23.2215 6.66944 23.3333 7 23.3333Z" fill="currentColor"/>
    </svg>
  `;

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
      console.log('Exporting data...');
    } else if (action === 'filter') {
      console.log('Opening filters...');
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
    console.log('Page changed to:', page);
  }

  closeDetail() {
    this.selectedTreatment = undefined;
  }

}
