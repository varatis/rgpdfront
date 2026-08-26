import { Component, Input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FiltrePreconisationPayload } from '../../../../../core/models/filtre-preconisation.payload';

@Component({
  selector: 'app-filtre-preconisation',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './filtre-preconisation.html',
  styleUrl: './filtre-preconisation.scss'
})
export class FiltrePreconisation {
  filtreClose = output<void>();
  filtreChange = output<FiltrePreconisationPayload>();

  libelle = '';

  @Input() set filters(value: FiltrePreconisationPayload) {
    this.libelle = value?.libelle ?? '';
  }

  onClose(): void {
    this.filtreClose.emit();
  }

  onReset(): void {
    this.libelle = '';
    this.filtreChange.emit({ libelle: '' });
  }

  onApply(): void {
    this.filtreChange.emit({
      libelle: this.libelle
    });
    this.onClose();
  }
}
