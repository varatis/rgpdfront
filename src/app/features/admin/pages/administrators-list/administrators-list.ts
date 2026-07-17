import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Administrator } from '../../../../shared/interfaces';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-administrators-list',
  imports: [CommonModule, MatIconModule],
  templateUrl: './administrators-list.html',
  styleUrl: './administrators-list.scss'
})
export class AdministratorsList implements OnInit {
  administrateurs: Administrator[] = [{ id: '1', nom: 'Doe', prenom: 'John', email: 'test@gmail.com',role: "super-admin", isActive: true, createdAt: new Date() },
    { id: '2', nom: 'Smith', prenom: 'Anna', email: 'test2@gmail.com', role: "admin", isActive: false, createdAt: new Date() },
    { id: '3', nom: 'Brown', prenom: 'James', email: 'test3@gmail.com', role: "admin", isActive: true, createdAt: new Date() } ,
    { id: '4', nom: 'Johnson', prenom: 'Emily', email: 'Johnson@outlook.com', role: "admin", isActive: true, createdAt: new Date() }
  ];

  selectedAdmin: Administrator | null = null;

  ngOnInit(): void {}

  onCreateAdmin(): void {}

  onEditAdmin(admin: Administrator): void {}

  onDeleteAdmin(admin: Administrator): void {}

  onFilterAdmins(): void {}
}
