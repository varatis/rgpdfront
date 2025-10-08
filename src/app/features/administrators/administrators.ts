import { Component, OnInit } from '@angular/core';
import { Administrator } from '../../shared/interfaces/administrator.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-administrators',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './administrators.html',
  styleUrl: './administrators.scss'
})
export class Administrators implements OnInit {
  administrateurs: Administrator[] = [{ id: '1', nom: 'Doe', prenom: 'John', email: 'test@gmail.com',role: "super-admin", isActive: true, createdAt: new Date() },  
    { id: '2', nom: 'Smith', prenom: 'Anna', email: 'test2@gmail.com', role: "admin", isActive: false, createdAt: new Date() },
    { id: '3', nom: 'Brown', prenom: 'James', email: 'test3@gmail.com', role: "user", isActive: true, createdAt: new Date() } 
  ];

  selectedAdmin: Administrator | null = null;

  ngOnInit(): void {}

  onCreateAdmin(): void {
    console.log('Créer un administrateur');
  }

  onEditAdmin(admin: Administrator): void {
    console.log('Modifier administrateur:', admin);
  }

  onDeleteAdmin(admin: Administrator): void {
    console.log('Supprimer administrateur:', admin);
  }

  onFilterAdmins(): void {
    console.log('Filtrer les administrateurs');
  }
}