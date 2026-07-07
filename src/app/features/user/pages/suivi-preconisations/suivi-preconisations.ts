import { Component } from '@angular/core';
import { TableColumn } from '../../../../shared/components/data-table/data-table';
import { HeaderAction } from '../../../../shared/components/header/header';
import { MasterDetailLayout } from "../../../../layout/master-detail-layout/master-detail-layout";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Pagination } from "../../../../shared/components/pagination/pagination";
import { PreconisationsTable } from "../../../../shared/components/preconisations-table/preconisations-table";
interface Preconisation {
  id: string;
  titre: string;
  priorite: 'tres-urgent' | 'urgent' | 'normal';
  prioriteLabel: string;
  complexite: 'moyennement-complexe' | 'tres-simple' | 'complexe';
  complexiteLabel: string;
  avancement: number;
  description: string;
  risqueEncouru: string;
  contrainte: string;
  cout: string;
}
@Component({
  selector: 'app-suivi-preconisations',
  standalone: true,
  imports: [CommonModule, MasterDetailLayout, Pagination, PreconisationsTable],
  templateUrl: './suivi-preconisations.html',
  styleUrl: './suivi-preconisations.scss'
})
export class SuiviPreconisations {
  pageTitle = 'Suivi des préconisations';
  icon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.58329 10.7084L14.2916 6.00008L13.125 4.79175L9.58329 8.33342L7.79163 6.58342L6.62496 7.75008L9.58329 10.7084ZM5.66663 14.0001C5.20829 14.0001 4.81593 13.8369 4.48954 13.5105C4.16315 13.1841 3.99996 12.7917 3.99996 12.3334V2.33341C3.99996 1.87508 4.16315 1.48272 4.48954 1.15633C4.81593 0.829943 5.20829 0.666748 5.66663 0.666748H15.6666C16.125 0.666748 16.5173 0.829943 16.8437 1.15633C17.1701 1.48272 17.3333 1.87508 17.3333 2.33341V12.3334C17.3333 12.7917 17.1701 13.1841 16.8437 13.5105C16.5173 13.8369 16.125 14.0001 15.6666 14.0001H5.66663ZM5.66663 12.3334H15.6666V2.33341H5.66663V12.3334ZM2.33329 17.3334C1.87496 17.3334 1.4826 17.1702 1.15621 16.8438C0.82982 16.5174 0.666626 16.1251 0.666626 15.6667V4.00008H2.33329V15.6667H14V17.3334H2.33329Z" fill="#161617"/>
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
    { key: 'titre', label: 'PRÉCONISATION', sortable: true, width: 'auto' },
    { key: 'prioriteLabel', label: 'PRIORITÉ', sortable: true, width: '150px' },
    { key: 'complexiteLabel', label: 'COMPLEXITÉ', sortable: true, width: '200px' },
    { key: 'avancementLabel', label: 'AVANCEMENT', sortable: true, width: '150px' }
  ];

  selectedPreconisation: Preconisation | null = null;
  currentPage = 1;
  itemsPerPage = 20;

  preconisations: Preconisation[] = [
    {
      id: 'P001',
      titre: 'Créer une adresse mail DPO',
      priorite: 'tres-urgent',
      prioriteLabel: 'Très urgent',
      complexite: 'tres-simple',
      complexiteLabel: 'Très simple',
      avancement: 50,
      description: 'Créer une adresse mail dédiée pour le DPO afin de centraliser les demandes.',
      risqueEncouru: 'Non-conformité RGPD',
      contrainte: 'Nécessite validation de la direction',
      cout: 'Faible - Configuration email uniquement'
    },
    {
      id: 'P002',
      titre: 'Gestion du Registre visiteur',
      priorite: 'tres-urgent',
      prioriteLabel: 'Très urgent',
      complexite: 'tres-simple',
      complexiteLabel: 'Très simple',
      avancement: 50,
      description: 'Mettre en place un registre pour suivre les visiteurs dans les locaux.',
      risqueEncouru: 'Problème de traçabilité',
      contrainte: 'Formation du personnel d\'accueil',
      cout: 'Faible - Registre papier ou digital simple'
    },
    {
      id: 'P003',
      titre: 'Consentement - Droit à l\'image',
      priorite: 'tres-urgent',
      prioriteLabel: 'Très urgent',
      complexite: 'tres-simple',
      complexiteLabel: 'Très simple',
      avancement: 50,
      description: 'Refaire une revue complète des consentements résidents et salariés pour intégrer toutes les cas de figure.',
      risqueEncouru: 'Être en infraction avec la CNIL',
      contrainte: 'Nécessite de gérer les refus de consentement en modifiant tous les protocoles',
      cout: 'Temps de gestion pour intégrer cette notion dans les nouveaux contrats'
    },
    {
      id: 'P004',
      titre: 'CV des candidats non retenus',
      priorite: 'tres-urgent',
      prioriteLabel: 'Très urgent',
      complexite: 'moyennement-complexe',
      complexiteLabel: 'Moyennement complexe',
      avancement: 50,
      description: 'Mettre en place une procédure de suppression des CV non retenus.',
      risqueEncouru: 'Conservation excessive de données personnelles',
      contrainte: 'Modifier le processus RH actuel',
      cout: 'Moyen - Formation et mise en place de procédures'
    },
    {
      id: 'P005',
      titre: 'Fermer les bureaux',
      priorite: 'tres-urgent',
      prioriteLabel: 'Très urgent',
      complexite: 'moyennement-complexe',
      complexiteLabel: 'Moyennement complexe',
      avancement: 50,
      description: 'S\'assurer que les bureaux sont fermés en dehors des heures de travail.',
      risqueEncouru: 'Accès non autorisé aux données',
      contrainte: 'Sensibilisation des équipes',
      cout: 'Faible - Formation et rappels'
    },
    {
      id: 'P006',
      titre: 'Listes de participants aux activités',
      priorite: 'tres-urgent',
      prioriteLabel: 'Très urgent',
      complexite: 'moyennement-complexe',
      complexiteLabel: 'Moyennement complexe',
      avancement: 50,
      description: 'Gérer les listes de participants en conformité avec le RGPD.',
      risqueEncouru: 'Divulgation non autorisée',
      contrainte: 'Revoir les protocoles de diffusion',
      cout: 'Moyen - Mise en place de nouvelles procédures'
    },
    {
      id: 'P007',
      titre: 'Mettre le bac contentant les analyses médicales derrière le comptoir de l\'accueil',
      priorite: 'tres-urgent',
      prioriteLabel: 'Très urgent',
      complexite: 'tres-simple',
      complexiteLabel: 'Très simple',
      avancement: 50,
      description: 'Sécuriser l\'accès aux documents médicaux sensibles.',
      risqueEncouru: 'Accès non autorisé à des données de santé',
      contrainte: 'Réorganisation de l\'espace accueil',
      cout: 'Très faible - Déplacement physique uniquement'
    },
    {
      id: 'P008',
      titre: 'Mettre le bloc des cartes vitales derrière le comptoir de l\'accueil',
      priorite: 'urgent',
      prioriteLabel: 'Urgent',
      complexite: 'tres-simple',
      complexiteLabel: 'Très simple',
      avancement: 50,
      description: 'Sécuriser l\'accès aux cartes vitales des résidents.',
      risqueEncouru: 'Vol ou utilisation frauduleuse',
      contrainte: 'Réorganisation de l\'espace accueil',
      cout: 'Très faible'
    },
    {
      id: 'P009',
      titre: 'Ajouter la mention RGPD',
      priorite: 'urgent',
      prioriteLabel: 'Urgent',
      complexite: 'tres-simple',
      complexiteLabel: 'Très simple',
      avancement: 50,
      description: 'Ajouter les mentions RGPD sur tous les formulaires.',
      risqueEncouru: 'Non-conformité légale',
      contrainte: 'Révision de tous les documents',
      cout: 'Faible - Mise à jour documentaire'
    },
    {
      id: 'P010',
      titre: 'Communiquer votre conformité RGPD',
      priorite: 'urgent',
      prioriteLabel: 'Urgent',
      complexite: 'tres-simple',
      complexiteLabel: 'Très simple',
      avancement: 50,
      description: 'Informer les parties prenantes de la conformité RGPD.',
      risqueEncouru: 'Manque de transparence',
      contrainte: 'Création de supports de communication',
      cout: 'Faible - Communication interne/externe'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {}

  // Computed properties
  get displayedPreconisations(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

     return this.preconisations.slice(startIndex, endIndex).map(p => ({
      id: p.id,
      titre: p.titre,
      priorite: p.priorite,
      prioriteLabel: p.prioriteLabel,
      complexite: p.complexite,
      complexiteLabel: p.complexiteLabel,
      avancement: p.avancement,
      _raw: p
    }));
  }

  get totalPages(): number {
    return Math.ceil(this.preconisations.length / this.itemsPerPage);
  }

  // Méthodes
  onSelectPreconisation(item: any): void {
    this.selectedPreconisation = item._raw || item;
  }

  onCloseDetail(): void {
    this.selectedPreconisation = null;
  }

  onHeaderAction(action: string): void {
    switch(action) {
      case 'export':
        this.onExportGlobal();
        break;
      case 'filter':
        this.onFilterPreconisations();
        break;
    }
  }

  onExportGlobal(): void {}

  onFilterPreconisations(): void {}

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPrioriteClass(priorite: string): string {
    const classes: { [key: string]: string } = {
      'tres-urgent': 'badge-danger',
      'urgent': 'badge-alert',
      'normal': 'badge-info'
    };
    return classes[priorite] || 'badge-info';
  }


   getComplexiteClass(complexite: string): string {
    const classes: { [key: string]: string } = {
      'moyennement-complexe': 'badge-alert',
      'tres-simple': 'badge-warning',
      'complexe': 'badge-danger'
    };
    return classes[complexite] || 'badge-info';
  }
}
