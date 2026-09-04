import { Component, Input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';

import {
  FILTRE_CLIENT_VIDE,
  FiltreClientPayload
} from '../../../../../core/models/filtre-client.payload';

@Component({
  selector: 'app-filtre-client',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDatepickerModule
  ],
  // Calendrier en français : saisie et affichage au format jj/mm/aaaa.
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' }
  ],
  templateUrl: './filtre-client.html',
  styleUrl: './filtre-client.scss'
})
export class FiltreClient {
  filtreClose = output<void>();
  filtreChange = output<FiltreClientPayload>();

  nom = '';
  version = '';
  /** Le datepicker manipule des `Date` ; la conversion en `yyyy-MM-dd` se fait à l'émission. */
  dateVersionDebut: Date | null = null;
  dateVersionFin: Date | null = null;

  /** Réhydrate le panneau avec les filtres déjà appliqués à sa réouverture. */
  @Input() set filters(value: FiltreClientPayload) {
    this.hydrate(value);
  }

  /**
   * Bornes inversées : la liste ressortirait vide sans rien signaler. Le calendrier
   * les empêche déjà via `min`/`max`, la saisie au clavier non.
   */
  get datesIncoherentes(): boolean {
    return !!this.dateVersionDebut
      && !!this.dateVersionFin
      && this.dateVersionDebut > this.dateVersionFin;
  }

  onClose(): void {
    this.filtreClose.emit();
  }

  onReset(): void {
    this.hydrate(FILTRE_CLIENT_VIDE);
    this.filtreChange.emit({ ...FILTRE_CLIENT_VIDE });
  }

  /** Le panneau reste ouvert après application : on enchaîne les essais de critères. */
  onApply(): void {
    if (this.datesIncoherentes) {
      return;
    }

    this.filtreChange.emit({
      nom: this.nom,
      version: this.version,
      dateVersionDebut: this.formatDate(this.dateVersionDebut),
      dateVersionFin: this.formatDate(this.dateVersionFin)
    });
  }

  private hydrate(value: FiltreClientPayload): void {
    this.nom = value?.nom ?? '';
    this.version = value?.version ?? '';
    this.dateVersionDebut = this.parseDate(value?.dateVersionDebut);
    this.dateVersionFin = this.parseDate(value?.dateVersionFin);
  }

  /** `yyyy-MM-dd` → date locale ; `new Date(iso)` serait interprété en UTC et reculerait d'un jour. */
  private parseDate(value?: string): Date | null {
    if (!value) {
      return null;
    }
    const [annee, mois, jour] = value.split('-').map(Number);
    if (!Number.isFinite(annee) || !Number.isFinite(mois) || !Number.isFinite(jour)) {
      return null;
    }
    return new Date(annee, mois - 1, jour);
  }

  /** Date locale → `yyyy-MM-dd` ; `toISOString()` décalerait la veille selon le fuseau. */
  private formatDate(date: Date | null): string {
    if (!date) {
      return '';
    }
    const mois = `${date.getMonth() + 1}`.padStart(2, '0');
    const jour = `${date.getDate()}`.padStart(2, '0');
    return `${date.getFullYear()}-${mois}-${jour}`;
  }
}
