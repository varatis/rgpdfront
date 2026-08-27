import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiService } from '../../../../../services/api.service';
import { HistoriqueEntry } from '../../../../../core/models/historique.model';
import { TraitementDetails } from '../../../../../core/models/traitement.model';
import { NlToBrPipe } from './nl-to-br.pipe';
import { DateFrPipe } from './date-fr.pipe';
import { ALL_TABS, TabConfig } from './field-config';
import { BoolFrPipe } from './bool-fr.pipe';

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

  readonly traitementId = input<number>();
  readonly userRole = input<UserRole>('client');
  readonly detailsLoaded = output<TraitementDetails>();

  readonly details = signal<TraitementDetails | undefined>(undefined);
  readonly activeTab = signal('Identification du traitement');
  readonly historique = signal<HistoriqueEntry[]>([]);

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
      this.historique.set([]);
      const subscription = this.apiService.getTraitementDetails(id).subscribe({
        next: (res) => {
          this.details.set(res);
          this.detailsLoaded.emit(res);
          this.loadHistorique(id);
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

    // La clé peut désigner un champ imbriqué (ex. 'finalitePrincipale.valeur') :
    // les champs adossés à un référentiel client sont renvoyés sous forme d'objet.
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


  reload(): void {
    const id = this.traitementId();
    if (id != null) {
      this.details.set(undefined);
      this.historique.set([]);
      this.apiService.getTraitementDetails(id).subscribe({
        next: (res) => {
          this.details.set(res);
          this.detailsLoaded.emit(res);
          this.loadHistorique(id);
        },
        error: (err) => console.error(err),
      });
    }
  }

  private loadHistorique(id: number): void {
    this.apiService.getTraitementHistorique(id).subscribe({
      next: (res) => this.historique.set(res ?? []),
      error: (err) => {
        if (err?.status === 404) {
          this.historique.set([]);
        } else {
          console.error(err);
          this.historique.set([]);
        }
      }
    });
  }

  formatHistoriqueDate(isoDate: string): string {
    if (!isoDate) return '-';
    const [datePart, timePart] = isoDate.split('T');
    if (!datePart || !timePart) return isoDate;
    const [y, m, d] = datePart.split('-');
    const [hh, mm] = timePart.split(':');
    if (y && m && d && hh && mm) {
      return `${d}/${m}/${y} ${hh}:${mm}`;
    }
    return isoDate;
  }

  get etablissementsDisplay(): string {
    const list = this.details()?.etablissements;
    return list?.length ? list.map(etablissement => etablissement.nom).join('<br>') : '-';
  }

  selectTab(tab: string, event: MouseEvent): void {
    this.activeTab.set(tab);
    (event.target as HTMLElement).scrollIntoView({
      behavior: 'smooth',
      inline: 'nearest',
      block: 'nearest',
    });
  }
}
