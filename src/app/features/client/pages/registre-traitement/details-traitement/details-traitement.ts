import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { ApiService } from '../../../../../services/api.service';
import { TraitementDetails } from '../../../../../core/models/traitement.model';
import { BoolFrPipe } from './bool-fr.pipe';
import { DateFrPipe } from './date-fr.pipe';
import { ALL_TABS, TabConfig } from './field-config';
import { NlToBrPipe } from './nl-to-br.pipe';

type UserRole = 'client' | 'admin' | 'superadmin';

@Component({
  selector: 'app-details-traitement',
  standalone: true,
  imports: [CommonModule, NlToBrPipe, DateFrPipe, BoolFrPipe],
  templateUrl: './details-traitement.html',
  styleUrls: ['./details-traitement.scss'],
})
export class DetailsTraitementComponent {
  private readonly apiService = inject(ApiService);
  private readonly historyDateFormatter = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  readonly traitementId = input<number>();
  readonly userRole = input<UserRole>('client');
  readonly detailsLoaded = output<TraitementDetails>();

  readonly details = signal<TraitementDetails | undefined>(undefined);
  readonly activeTab = signal('Identification du traitement');

  readonly tabs = computed<TabConfig[]>(() =>
    this.userRole() === 'client'
      ? ALL_TABS.filter(tab => tab.name !== 'Analyse de conformité')
      : ALL_TABS
  );

  readonly activeTabConfig = computed(() =>
    this.tabs().find(tab => tab.name === this.activeTab())
  );

  constructor() {
    effect((onCleanup) => {
      const id = this.traitementId();

      if (id == null) {
        this.details.set(undefined);
        return;
      }

      this.details.set(undefined);
      const subscription = this.apiService.getTraitementDetails(id).subscribe({
        next: (res) => {
          this.details.set(res);
          this.detailsLoaded.emit(res);
        },
        error: (err) => console.error(err),
      });

      onCleanup(() => subscription.unsubscribe());
    });

    effect(() => {
      if (!this.tabs().some(tab => tab.name === this.activeTab())) {
        this.activeTab.set(this.tabs()[0]?.name ?? '');
      }
    });
  }

  fieldValue(key: string): string | null | undefined {
    const details = this.details();
    if (!details) {
      return undefined;
    }

    const value = key.split('.').reduce<unknown>(
      (current, segment) =>
        current == null ? current : (current as Record<string, unknown>)[segment],
      details,
    );
    if (value == null) {
      return value;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    return String(value);
  }

  customValue(getter: string): string {
    switch (getter) {
      case 'etablissementsDisplay':
        return this.etablissementsDisplay;
      case 'historiqueDisplay':
        return this.historiqueDisplay;
      default:
        return '-';
    }
  }

  get etablissementsDisplay(): string {
    const list = this.details()?.etablissements;
    return list?.length ? list.map(etablissement => etablissement.nom).join('\n') : '-';
  }

  get historiqueDisplay(): string {
    const details = this.details();
    if (!details) {
      return '-';
    }

    const historiqueCalcule = (details.historiqueTraitement ?? [])
      .map(entree => {
        const motif = entree?.motif?.trim();
        if (!motif) {
          return null;
        }

        const prefixe = [
          this.formatHistoriqueDate(entree?.date),
          entree?.auteur?.trim() || 'Auteur inconnu'
        ].filter(Boolean).join(' — ');

        return prefixe ? `${prefixe} : ${motif}` : motif;
      })
      .filter((value): value is string => !!value)
      .join('\n');

    const historiqueImporte = details.historiqueModifications?.trim();

    if (historiqueCalcule && historiqueImporte) {
      return `${historiqueCalcule}\n\nHistorique importé :\n${historiqueImporte}`;
    }

    return historiqueCalcule || historiqueImporte || '-';
  }

  selectTab(tab: string, event: MouseEvent): void {
    this.activeTab.set(tab);
    (event.target as HTMLElement).scrollIntoView({
      behavior: 'smooth',
      inline: 'nearest',
      block: 'nearest',
    });
  }

  private formatHistoriqueDate(value: string | Date | null | undefined): string {
    if (!value) {
      return '';
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return this.historyDateFormatter.format(date);
  }
}
