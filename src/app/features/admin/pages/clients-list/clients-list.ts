import { Component, OnInit } from '@angular/core';
import { Client } from '../../../../shared/interfaces/client.interface';
import { Router } from '@angular/router';
import { MasterDetailLayout } from '../../../../layout/master-detail-layout/master-detail-layout';
import { PageTabsComponent,PageTab } from '../../../../shared/components/page-tabs/page-tab/page-tab';
import { CommonModule } from '@angular/common';
import { Header, HeaderAction } from '../../../../shared/components/header/header';

@Component({
  selector: 'app-clients-list',
  standalone: true,
  imports: [CommonModule,MasterDetailLayout,PageTabsComponent],
  templateUrl: './clients-list.html',
  styleUrl: './clients-list.scss'
})
export class ClientsList implements OnInit {

  selectedClient: Client | null = null;
  activeTab: 'actuel' | 'archive' = 'actuel';

  // Contrôle si la liste "CLIENT" est ouverte
  clientsListOpen = true;
  pageTitle = 'Clients';
  clientIconSvg: string = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">...</svg>';
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


  get actuelsCount() { return this.clientsActifs.length; }
  get archivesCount() { return this.clientsArchives.length; }
  
  // 2. Définition des onglets de page
get pageTabs(): PageTab[] {
    return [
      { key: 'actuel', label: 'Actuel', count: this.actuelsCount },
      { key: 'archive', label: 'Archivé', count: this.archivesCount }
    ];

  }

  clientsActifs: Client[] = [
    { id: '1', name: 'Acme Co.', description: 'Entreprise A', logo: '', isActive: true, users: [{ id: 'u1', nom: 'Hawkins', prenom: 'Guy', fonction: 'Directeur informatique', email: 'guy.hawkins@mail.fr' }], createdAt: new Date('2024-01-15'), updatedAt: new Date('2024-06-15') },
    { id: '2', name: 'Beta Corp.', description: 'Entreprise B', logo: '', isActive: true, users: [{ id: 'u2', nom: 'Watson', prenom: 'Kristin', fonction: 'Directeur marketing', email: 'kristin.watson@mail.fr' }], createdAt: new Date('2024-02-20'), updatedAt: new Date('2024-06-10') },
    { id: '3', name: 'Gamma LLC', description: 'Entreprise C', logo: '', isActive: true, users: [{ id: 'u3', nom: 'Watson', prenom: 'Kristin', fonction: 'Directeur marketing', email: 'kristin.watson@mail.fr' }], createdAt: new Date('2024-03-25'), updatedAt: new Date('2024-06-05') },
    { id: '4', name: 'Delta Inc.', description: 'Entreprise D', logo: '', isActive: true, users: [{ id: 'u4', nom: 'Watson', prenom: 'Kristin', fonction: 'Directeur marketing', email: 'kristin.watson@mail.fr' }], createdAt: new Date('2024-04-30'), updatedAt: new Date('2024-06-01') }
  ];

  clientsArchives: Client[] = [
    { id: '5', name: 'Epsilon Ltd.', description: 'Entreprise E', logo: '', isActive: false, users: [{ id: 'u4', nom: 'Watson', prenom: 'Kristin', fonction: 'Directeur marketing', email: 'kristin.watson@mail.fr' }], createdAt: new Date('2023-05-10'), updatedAt: new Date('2024-01-15') },
    { id: '6', name: 'Zeta GmbH', description: 'Entreprise F', logo: '', isActive: false, users: [{ id: 'u6', nom: 'Watson', prenom: 'Kristin', fonction: 'Directeur marketing', email: 'kristin.watson@mail.fr' }], createdAt: new Date('2023-06-15'), updatedAt: new Date('2024-02-20') }
  ];

onSelectClient(client: Client) {
    this.selectedClient = client;
  }

  constructor(private router: Router) {}

  ngOnInit(): void {}

  get displayedClients(): Client[] {
    return this.activeTab === 'actuel' ? this.clientsActifs : this.clientsArchives;
  }


  setActiveTab(key: string) {
    this.activeTab = key as 'actuel' | 'archive';
    this.selectedClient = null; 
  }

  /* COLLAPSIBLE */
  toggleClientsList(): void {
    //if (this.selectedClient) return;
    this.clientsListOpen = !this.clientsListOpen;
  }

  onSelectFromList(client: Client): void {
    this.selectedClient = client;
    this.clientsListOpen = false;
  }

  onCreateClient(): void { console.log('Créer un client'); }
  onFilterClients(): void { console.log('Filtrer les clients'); }
  onEditClient(client: Client): void { console.log('Modifier client:', client); }
  onArchiveClient(client: Client): void { console.log('Archiver client:', client); }
  onDeleteClient(client: Client): void { console.log('Supprimer client:', client); }

}
