import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { Preconisation } from '../../shared/interfaces';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-preconisations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preconisations.html',
  styleUrl: './preconisations.scss'
})
export class Preconisations implements OnInit {
  preconisations: Preconisation[] = [
    { id: '1', titre: 'Créer une adresse mail DPO', priorite: 'Très urgent', complexite: 'Très simple' },
    { id: '2', titre: 'CV des candidats non retenus', priorite: 'Très urgent', complexite: 'Moyennement complexe' },
    { id: '3', titre: 'Fermer les bureaux', priorite: 'Urgent', complexite: 'Très simple' }
  ];

  ngOnInit(): void {}

  onFilterPreconisations(): void {
    console.log('Filtrer les préconisations');
  }

  onCreatePreconisation(): void {
    console.log('Créer une nouvelle préconisation');
  }

}
