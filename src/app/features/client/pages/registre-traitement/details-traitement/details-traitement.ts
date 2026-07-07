import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiService } from '../../../../../services/api.service';
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

    const value = (details as unknown as Record<string, unknown>)[key];
    if (value == null) {
      return value;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    return String(value);
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
