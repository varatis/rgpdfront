import {
  Component, computed, effect, inject, input, output, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, switchMap, tap } from 'rxjs';

import { ApiService } from '../../../../../services/api.service';
import { TraitementDetails } from '../../../../../core/models/traitement.model';
import { NlToBrPipe } from './nl-to-br.pipe';
import { DateFrPipe } from './date-fr.pipe';
import { ALL_TABS, TabConfig } from './field-config';
import { BoolFrPipe } from './bool-fr.pipe';

@Component({
  selector: 'app-details-traitement',
  standalone: true,
  imports: [CommonModule, NlToBrPipe, DateFrPipe, BoolFrPipe],
  templateUrl: './details-traitement.html',
  styleUrls: ['./details-traitement.scss'],
})
export class DetailsTraitementComponent {
  private readonly api = inject(ApiService);

  readonly traitementId = input<number>();
  readonly userRole = input<'client' | 'user'>('client');
  readonly detailsLoaded = output<TraitementDetails>();

  readonly details = signal<TraitementDetails | undefined>(undefined);
  readonly activeTab = signal('Identification du traitement');

  readonly tabs = computed<TabConfig[]>(() =>
    this.userRole() === 'user'
      ? ALL_TABS.filter(t => t.name !== 'Analyse de conformité')
      : ALL_TABS
  );

  readonly activeTabConfig = computed(() =>
    this.tabs().find(t => t.name === this.activeTab()),
  );

  constructor() {
    toObservable(this.traitementId).pipe(
      filter((id): id is number => id != null),
      tap(() => this.details.set(undefined)),
      switchMap(id => this.api.getTraitementDetails(id)),
    ).subscribe({
      next: res => {
        this.details.set(res);
        this.detailsLoaded.emit(res);
      },
      error: err => console.error(err),
    });

    effect(() => {
      const tabNames = this.tabs().map(t => t.name);
      if (!tabNames.includes(this.activeTab())) {
        this.activeTab.set(tabNames[0]);
      }
    });
  }

  fieldValue(key: string): string | null | undefined {
    const d = this.details();
    if (!d) return undefined;
    const val = (d as unknown as Record<string, unknown>)[key];
    if (val == null) return val;
    return String(val);
  }

  get etablissementsDisplay(): string {
    const list = this.details()?.etablissements;
    return list?.length ? list.map(e => e.nom).join('<br>') : '-';
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