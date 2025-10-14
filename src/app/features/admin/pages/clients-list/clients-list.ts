import { Component, OnInit } from '@angular/core';
import { Client } from '../../../../shared/interfaces/client.interface';
import { TableColumn } from '../../../../shared/interfaces/table.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-clients-list',
  imports: [],
  templateUrl: './clients-list.html',
  styleUrl: './clients-list.scss'
})
export class ClientsList implements OnInit {

  selectedClient: Client | null = null;
  activeTab: 'actuel' | 'archive' = 'actuel';

  // Contrôle si la liste "CLIENT" est ouverte
  clientsListOpen = true;

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

  columns: TableColumn[] = [
    { key: 'name', label: 'CLIENT', sortable: true },
    { key: 'description', label: 'DESCRIPTION', sortable: false },
    { key: 'createdAt', label: 'DATE DE CRÉATION', dataType: 'date', sortable: true },
    { key: 'updatedAt', label: 'DERNIÈRE ACTIVITÉ', dataType: 'date', sortable: true }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {}

  get displayedClients(): Client[] {
    return this.activeTab === 'actuel' ? this.clientsActifs : this.clientsArchives;
  }

  get actuelsCount(): number { return this.clientsActifs.length; }
  get archivesCount(): number { return this.clientsArchives.length; }

  setActiveTab(tab: 'actuel' | 'archive'): void {
    this.activeTab = tab;
    this.selectedClient = null;
    this.clientsListOpen = true;
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
