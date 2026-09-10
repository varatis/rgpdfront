import { Component, Input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import {
  FILTRE_ADMINISTRATEUR_VIDE,
  FiltreAdministrateurPayload
} from '../../../../../core/models/filtre-administrateur.payload';

@Component({
  selector: 'app-filtre-administrateur',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './filtre-administrateur.html',
  styleUrl: './filtre-administrateur.scss'
})
export class FiltreAdministrateur {
  filtreClose = output<void>();
  filtreChange = output<FiltreAdministrateurPayload>();

  nom = '';
  prenom = '';
  client = '';

  @Input() set filters(value: FiltreAdministrateurPayload) {
    this.hydrate(value);
  }

  onClose(): void {
    this.filtreClose.emit();
  }

  onReset(): void {
    this.hydrate(FILTRE_ADMINISTRATEUR_VIDE);
    this.filtreChange.emit({ ...FILTRE_ADMINISTRATEUR_VIDE });
  }

  onApply(): void {
    this.filtreChange.emit({
      nom: this.nom,
      prenom: this.prenom,
      client: this.client
    });
  }

  private hydrate(value: FiltreAdministrateurPayload): void {
    this.nom = value?.nom ?? '';
    this.prenom = value?.prenom ?? '';
    this.client = value?.client ?? '';
  }
}
