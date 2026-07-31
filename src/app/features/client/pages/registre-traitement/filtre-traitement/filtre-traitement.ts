import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FiltreTraitementPayload } from '../../../../../core/models/filtre-traitement.payload';

@Component({
  selector: 'app-filtre-traitement',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './filtre-traitement.html',
  styleUrl: './filtre-traitement.scss'
})
export class FiltreTraitement {
  filtreClose = output<void>();
  filtreChange = output<FiltreTraitementPayload>();

  traitement = '';
  gestionnaire = '';
  finalitePrincipale = '';

  onClose(): void {
    this.filtreClose.emit();
  }

  onReset(): void {
    this.traitement = '';
    this.gestionnaire = '';
    this.finalitePrincipale = '';
    this.filtreChange.emit({ traitement: '', gestionnaire: '', finalitePrincipale: '' });
  }

  onApply(): void {
    this.filtreChange.emit({
      traitement: this.traitement,
      gestionnaire: this.gestionnaire,
      finalitePrincipale: this.finalitePrincipale
    });
  }
}
