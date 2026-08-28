import { Injectable, Provider } from '@angular/core';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatDateFormats,
  NativeDateAdapter,
} from '@angular/material/core';
import { MatDatepickerIntl } from '@angular/material/datepicker';

/**
 * Configuration du datepicker Angular Material pour un usage français.
 *
 * L'adaptateur natif (`MatNativeDateModule`) délègue toute analyse de saisie à
 * `Date.parse`, qui interprète « 05/08/2026 » selon la convention américaine
 * (8 mai 2026). `FrenchDateAdapter` corrige ce point en lisant les dates au
 * format JJ/MM/AAAA, et `FR_DATE_FORMATS` garantit l'affichage JJ/MM/AAAA.
 */

/** Date complète saisie par l'utilisateur : jj/mm/aaaa, jj-mm-aaaa, jj.mm.aaaa. */
const FULL_DATE_REGEX = /^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})$/;

/** Début de saisie : deux groupes numériques séparés, année absente ou tronquée. */
const PARTIAL_DATE_REGEX = /^\d{1,2}[/.\-]\d{1,2}([/.\-]\d{1,4})?$/;

/** Date ISO (aaaa-mm-jj…) renvoyée par le back lors d'un pré-remplissage. */
const ISO_DATE_REGEX = /^(\d{4})-(\d{1,2})-(\d{1,2})/;

export const FR_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: null,
  },
  display: {
    dateInput: { day: '2-digit', month: '2-digit', year: 'numeric' },
    monthLabel: { month: 'long' },
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  },
};

@Injectable()
export class FrenchDateAdapter extends NativeDateAdapter {
  override parse(value: unknown): Date | null {
    if (value instanceof Date) {
      return value;
    }
    if (typeof value === 'number') {
      return new Date(value);
    }
    if (typeof value !== 'string') {
      return null;
    }

    const text = value.trim();
    if (!text) {
      return null;
    }

    // Valeur servie par le back (ou saisie au format ISO) : aaaa-mm-jj.
    const iso = ISO_DATE_REGEX.exec(text);
    if (iso) {
      return this.buildDate(Number(iso[3]), Number(iso[2]), Number(iso[1]));
    }

    const full = FULL_DATE_REGEX.exec(text);
    if (full) {
      let year = Number(full[3]);
      if (full[3].length < 4) {
        year += year < 70 ? 2000 : 1900;
      }
      return this.buildDate(Number(full[1]), Number(full[2]), year);
    }

    // Saisie encore incomplète (ex. « 12/7 ») : on remonte une erreur de format
    // plutôt que de laisser Date.parse deviner une convention américaine.
    if (PARTIAL_DATE_REGEX.test(text)) {
      return this.invalid();
    }

    // Les dates libellées (« 5 août 2026 ») restent gérées nativement.
    return super.parse(text, null);
  }

  /**
   * Construit une date locale à minuit. `setFullYear` autorise les débordements
   * (31/02 devient le 3 mars) : on compare donc les composantes obtenues pour
   * refuser les jours inexistants, ce que `NativeDateAdapter.createDate` fait en
   * levant une exception en mode dev.
   */
  private buildDate(day: number, month: number, year: number): Date {
    if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1) {
      return this.invalid();
    }

    const date = new Date();
    date.setFullYear(year, month - 1, day);
    date.setHours(0, 0, 0, 0);

    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return this.invalid();
    }

    return date;
  }
}

/** Libellés du calendrier en français (l'adaptateur fournit déjà les mois et jours). */
@Injectable()
export class FrenchDatepickerIntl extends MatDatepickerIntl {
  override calendarLabel = 'Calendrier';
  override openCalendarLabel = 'Choisir une date dans le calendrier';
  override closeCalendarLabel = 'Fermer le calendrier';
  override prevMonthLabel = 'Mois précédent';
  override nextMonthLabel = 'Mois suivant';
  override prevYearLabel = 'Année précédente';
  override nextYearLabel = 'Année suivante';
  override prevMultiYearLabel = 'Plage d’années précédente';
  override nextMultiYearLabel = 'Plage d’années suivante';
  override switchToMonthViewLabel = 'Choisir un mois';
  override switchToMultiYearViewLabel = 'Choisir une année';
}

/**
 * A fournir sur le composant qui héberge le datepicker : le reste de
 * l’application conserve les réglages par défaut de Material.
 */
export function provideFrenchDatepicker(): Provider[] {
  return [
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
    { provide: DateAdapter, useClass: FrenchDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: FR_DATE_FORMATS },
    { provide: MatDatepickerIntl, useClass: FrenchDatepickerIntl },
  ];
}

/** Format ISO (aaaa-mm-jj) attendu par le back pour un `LocalDate`. */
export function toIsoDate(value: unknown): string | null {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return null;
    }
    const pad = (part: number): string => String(part).padStart(2, '0');
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  }

  if (typeof value === 'string' && value.trim()) {
    const iso = ISO_DATE_REGEX.exec(value.trim());
    return iso ? `${iso[1]}-${iso[2]}-${iso[3]}` : null;
  }

  return null;
}
