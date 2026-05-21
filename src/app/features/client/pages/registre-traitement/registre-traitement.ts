import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header, HeaderAction } from '../../../../shared/components/header/header';
import { TableTraitement } from '../registre-traitement/table-traitement/table-traitement';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { DetailsTraitementComponent } from '../registre-traitement/details-traitement/details-traitement';
import { ApiService } from '../../../../services/api.service';
import { Traitement } from '../../../../core/models/traitement.model';

@Component({
  selector: 'app-registre-traitement',
  standalone: true,
  imports: [CommonModule, Header, TableTraitement, Pagination, DetailsTraitementComponent],
  templateUrl: './registre-traitement.html',
  styleUrls: ['./registre-traitement.scss'],
})
export class RegistreTraitement implements OnInit {
  constructor(private apiService: ApiService) { }
  title = 'Registre des activités de traitement';
  icon = `
    <svg viewBox="0 0 28 28" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 25.6667C6.02778 25.6667 5.20139 25.3264 4.52083 24.6458C3.84028 23.9653 3.5 23.1389 3.5 22.1667V18.6667H7V2.33333H24.5V22.1667C24.5 23.1389 24.1597 23.9653 23.4792 24.6458C22.7986 25.3264 21.9722 25.6667 21 25.6667H7ZM21 23.3333C21.3306 23.3333 21.6076 23.2215 21.8312 22.9979C22.0549 22.7743 22.1667 22.4972 22.1667 22.1667V4.66666H9.33333V18.6667H19.8333V22.1667C19.8333 22.4972 19.9451 22.7743 20.1688 22.9979C20.3924 23.2215 20.6694 23.3333 21 23.3333ZM10.5 10.5V8.16666H21V10.5H10.5ZM10.5 14V11.6667H21V14H10.5ZM7 23.3333H17.5V21H5.83333V22.1667C5.83333 22.4972 5.94514 22.7743 6.16875 22.9979C6.39236 23.2215 6.66944 23.3333 7 23.3333Z" fill="currentColor"/>
    </svg>
  `;

  actions: HeaderAction[] = [
    {
      label: 'Filtres',
      icon: `
    <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 12V10H11V12H7ZM3 7V5H15V7H3ZM0 2V0H18V2H0Z" fill="currentColor" />
      </svg>
  `,
      action: 'filter',
      color: 'default',
    },
    { label: 'Ajouter un traitement', icon: '+', action: 'add', color: 'primary' },
  ];

  currentPage = 2;
  traitementSelectionne?: Traitement;
  //  data: Traitement[] = [
  //   {
  //     id: 1,
  //     nom: 'Pré inscription',
  //     gestionnaire: 'Chefs de service et directeurs & psychologue',
  //     finalite:
  //       "Collecter les informations personnelles permettant d'inscrire les demandeurs sur liste d'attente.",
  //   },
  //   {
  //     id: 2,
  //     nom: 'Admission',
  //     gestionnaire: 'Chefs de service et directeurs',
  //     finalite:
  //       "Collecter les informations personnelles permettant d'enregistrer administrativement le nouvel usager",
  //   },
  //   {
  //     id: 3,
  //     nom: 'Admission',
  //     gestionnaire: 'Chefs de service et directeurs',
  //     finalite:
  //       "Collecter les informations personnelles permettant d'enregistrer administrativement le nouvel usager",
  //   },
  //   {
  //     id: 4,
  //     nom: 'Admission',
  //     gestionnaire: 'Chefs de service et directeurs',
  //     finalite:
  //       "Collecter les informations personnelles permettant d'enregistrer administrativement le nouvel usager",
  //   },
  //   {
  //     id: 5,
  //     nom: 'Admission',
  //     gestionnaire: 'Chefs de service et directeurs',
  //     finalite:
  //       "Collecter les informations personnelles permettant d'enregistrer administrativement le nouvel usager",
  //   },
  //   {
  //     id: 6,
  //     nom: 'Admission',
  //     gestionnaire: 'Secrétaire',
  //     finalite:
  //       "Collecter les informations personnelles permettant d'enregistrer administrativement le nouvel usager",
  //   },
  //   {
  //     id: 7,
  //     nom: 'Admission',
  //     gestionnaire: 'Chefs de service et directeurs',
  //     finalite:
  //       "Collecter les informations personnelles permettant d'enregistrer administrativement le nouvel usager",
  //   },
  //   {
  //     id: 8,
  //     nom: 'Admission',
  //     gestionnaire: 'Chefs de service et directeurs',
  //     finalite:
  //       "Collecter les informations personnelles permettant d'enregistrer administrativement le nouvel usager",
  //   },
  //   {
  //     id: 9,
  //     nom: 'Admission',
  //     gestionnaire: 'Chefs de service et directeurs',
  //     finalite:
  //       "Collecter les informations personnelles permettant d'enregistrer administrativement le nouvel usager",
  //   },
  //   {
  //     id: 10,
  //     nom: 'Accompagnement des usagers - Partie non médicale',
  //     gestionnaire: 'Chef de service',
  //     finalite:
  //       "Collecter et utiliser des données permettant de construire le projet d'accompagnement personnalisé des usagers et d'organiser et tracer l'accompagnement à apporter",
  //   },
  // ];

  data: Traitement[] = [];
  page = 0;
  size = 10;
  totalElements = 0;
  totalPages = 0;

  ngOnInit(): void {
    this.loadTraitements(0);
  }

  loadTraitements(page: number): void {
    this.apiService.getTraitements(page, this.size)
      .subscribe({
        next: (res) => {
          this.data = res.content;
          this.page = res.number;
          this.size = res.size;
          this.totalElements = res.totalElements;
          this.totalPages = res.totalPages;
        },
        error: (err) => console.error(err)
      });
  }

  onActionClick(action: string) {
    if (action === 'export') {
      console.log('Exporting data...');
    } else if (action === 'filter') {
      console.log('Opening filters...');
    }
  }

  onSelectTraitement(item: Traitement) {
    if (this.traitementSelectionne?.id === item.id) {
      this.traitementSelectionne = undefined;
    } else {
      this.traitementSelectionne = item;
    }
  }

  onPageChange(page: number) {
    this.currentPage = page;
    console.log('Page changed to:', page);
    if (page > 0) {
      this.loadTraitements(page - 1);
    }
  }

  closeDetail() {
    this.traitementSelectionne = undefined;
  }
}
