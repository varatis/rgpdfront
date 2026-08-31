import { Component, Input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { FILTRE_VIOLATION_VIDE, FiltreViolationPayload } from '../../../../../core/models/filtre-violation.payload';

interface RisqueOption {
  key: string;
  label: string;
  value: boolean | null;
}

@Component({
  selector: 'app-filtre-violation',
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
  templateUrl: './filtre-violation.html',
  styleUrl: './filtre-violation.scss'
})
export class FiltreViolation {
  filtreClose = output<void>();
  filtreChange = output<FiltreViolationPayload>();

  natureViolation = '';
  donneesConcernees = '';
  /** `null` = « Tous » : le back ne filtre que si le critère est transmis. */
  risqueEleveDroitsLibertes: boolean | null = null;
  /** Le datepicker manipule des `Date` ; la conversion en `yyyy-MM-dd` se fait à l'émission. */
  dateViolationDebut: Date | null = null;
  dateViolationFin: Date | null = null;
  nombrePersonnesConcerneesMin: number | null = null;
  nombrePersonnesConcerneesMax: number | null = null;

  readonly risqueOptions: RisqueOption[] = [
    { key: 'tous', label: 'Tous', value: null },
    { key: 'oui', label: 'Oui', value: true },
    { key: 'non', label: 'Non', value: false }
  ];

  /** Réhydrate le panneau avec les filtres déjà appliqués à sa réouverture. */
  @Input() set filters(value: FiltreViolationPayload) {
    this.hydrate(value);
  }

  private hydrate(value: FiltreViolationPayload): void {
    this.natureViolation = value?.natureViolation ?? '';
    this.donneesConcernees = value?.donneesConcernees ?? '';
    this.risqueEleveDroitsLibertes = value?.risqueEleveDroitsLibertes ?? null;
    this.dateViolationDebut = this.parseDate(value?.dateViolationDebut);
    this.dateViolationFin = this.parseDate(value?.dateViolationFin);
    this.nombrePersonnesConcerneesMin = value?.nombrePersonnesConcerneesMin ?? null;
    this.nombrePersonnesConcerneesMax = value?.nombrePersonnesConcerneesMax ?? null;
  }

  /**
   * Bornes inversées : le back renverrait une liste vide sans rien signaler.
   * Le calendrier les empêche déjà via `min`/`max`, la saisie au clavier non.
   */
  get datesIncoherentes(): boolean {
    return !!this.dateViolationDebut
      && !!this.dateViolationFin
      && this.dateViolationDebut > this.dateViolationFin;
  }

  get nombresIncoherents(): boolean {
    return this.nombrePersonnesConcerneesMin != null
      && this.nombrePersonnesConcerneesMax != null
      && this.nombrePersonnesConcerneesMin > this.nombrePersonnesConcerneesMax;
  }

  get bornesIncoherentes(): boolean {
    return this.datesIncoherentes || this.nombresIncoherents;
  }

  onSelectRisque(value: boolean | null): void {
    this.risqueEleveDroitsLibertes = value;
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

  onClose(): void {
    this.filtreClose.emit();
  }

  onReset(): void {
    this.hydrate(FILTRE_VIOLATION_VIDE);
    this.filtreChange.emit({ ...FILTRE_VIOLATION_VIDE });
  }

  /** Le panneau reste ouvert après application : on enchaîne les essais de critères. */
  onApply(): void {
    if (this.bornesIncoherentes) {
      return;
    }

    this.filtreChange.emit({
      natureViolation: this.natureViolation,
      donneesConcernees: this.donneesConcernees,
      risqueEleveDroitsLibertes: this.risqueEleveDroitsLibertes,
      dateViolationDebut: this.formatDate(this.dateViolationDebut),
      dateViolationFin: this.formatDate(this.dateViolationFin),
      nombrePersonnesConcerneesMin: this.nombrePersonnesConcerneesMin,
      nombrePersonnesConcerneesMax: this.nombrePersonnesConcerneesMax
    });
  }
}
