import { Component, OnInit } from '@angular/core';
import { Client } from '../../../../shared/interfaces/client.interface';
import { MasterDetailLayout } from '../../../../layout/master-detail-layout/master-detail-layout';
import { PageTabsComponent,PageTab } from '../../../../shared/components/page-tabs/page-tab/page-tab';
import { CommonModule } from '@angular/common';
import { HeaderAction } from '../../../../shared/components/header/header';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-clients-list',
  standalone: true,
  imports: [CommonModule,MasterDetailLayout,PageTabsComponent,MatIconModule],
  templateUrl: './clients-list.html',
  styleUrl: './clients-list.scss'
})
export class ClientsList implements OnInit {

  selectedClient: Client | null = null;
  activeTab: 'actuel' | 'archive' = 'actuel';

  // Contrôle si la liste "CLIENT" est ouverte
  clientsListOpen = true;
  pageTitle = 'Clients';
  clientIcon: string = 'business';
  actions: HeaderAction[] = [
    { label: 'Export global', icon: 'download', action: 'add', color: 'default' },
    { label: 'Filtres', icon: 'tune', action: 'filter', color: 'default' }
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

  constructor() {}

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

  onCreateClient(): void {}
  onFilterClients(): void {}
  onEditClient(client: Client): void {}
  onArchiveClient(client: Client): void {}
  onDeleteClient(client: Client): void {}

}
