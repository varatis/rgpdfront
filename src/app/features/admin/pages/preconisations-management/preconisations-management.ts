import { Component } from '@angular/core';
import { Preconisation } from '../../../../shared/interfaces';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-preconisations-management',
  imports: [CommonModule],
  templateUrl: './preconisations-management.html',
  styleUrl: './preconisations-management.scss'
})
export class PreconisationsManagement {
preconisations: Preconisation[] = [
    { id: '1', titre: 'Créer une adresse mail DPO', priorite: 'Très urgent', complexite: 'Très simple' },
    { id: '2', titre: 'CV des candidats non retenus', priorite: 'Très urgent', complexite: 'Moyennement complexe' },
    { id: '3', titre: 'Fermer les bureaux', priorite: 'Urgent', complexite: 'Très simple' },
    { id: '4', titre: 'Mettre en place un registre de traitement', priorite: 'Très urgent', complexite: 'Complexe' },
    { id: '5', titre: 'Former les employés au RGPD', priorite: 'Urgent', complexite: 'Moyennement complexe' },
    { id: '6', titre: 'Auditer les systèmes de sécurité', priorite: 'Urgent', complexite: 'Complexe' },
    { id: '7', titre: 'Mettre à jour la politique de confidentialité', priorite: 'Très urgent', complexite: 'Moyennement complexe' },
    { id: '8', titre: 'Nommer un DPO', priorite: 'Très urgent', complexite: 'Très simple' },
    { id: '9', titre: 'Mettre en place des mesures de sécurité techniques et organisationnelles', priorite: 'Urgent', complexite: 'Complexe' },
    { id: '10', titre: 'Mettre en place un processus de gestion des violations de données', priorite: 'Très urgent', complexite: 'Complexe' },
    { id: '11', titre: 'Mettre en place des contrats avec les sous-traitants', priorite: 'Urgent', complexite: 'Moyennement complexe' }

  ];

  ngOnInit(): void {}

  onFilterPreconisations(): void {
    console.log('Filtrer les préconisations');
  }

  onCreatePreconisation(): void {
    console.log('Créer une nouvelle préconisation');
  }
}
