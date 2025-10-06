import { Component, OnInit } from '@angular/core';
import { Administrator } from '../../shared/interfaces/administrator.interface';
import { TableAction, TableColumn } from '../../shared/interfaces';
import { Card } from '../../shared/components/card/card';
import { Button } from '../../shared/components/button/button';
import { DataTable } from '../../shared/components/data-table/data-table';

@Component({
  selector: 'app-administrators',
  standalone: true,
  imports: [Card, Button, DataTable],
  templateUrl: './administrators.html',
  styleUrl: './administrators.scss'
})
export class Administrators implements OnInit {
  administrators: Administrator[] = [
    {
      id: '1',
      nom: 'Doe',
      prenom: 'John',
      email: 'john.doe@mail.fr',
      role: 'super-admin',
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date()
    }
  ];

  columns: TableColumn[] = [
    { key: 'nom', label: 'Nom', sortable: true },
    { key: 'prenom', label: 'Prénom', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Rôle', sortable: true },
    { key: 'isActive', label: 'Statut', dataType: 'boolean' }
  ];

  actions: TableAction[] = [
    { name: 'edit', label: 'Modifier', icon: 'edit', color: 'primary' },
    { name: 'delete', label: 'Supprimer', icon: 'delete', color: 'danger' }
  ];

  constructor() { }

  ngOnInit(): void { }

  onAddAdmin(): void {
    // Ajoutez ici la logique pour ajouter un administrateur
    console.log('Ajouter un administrateur');
  }

  onEdit(admin: Administrator): void {
    console.log('Modifier:', admin);
  }

  onDelete(admin: Administrator): void {
    console.log('Supprimer:', admin);
  }
}