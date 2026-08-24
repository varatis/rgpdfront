import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {
  avancementClass,
  complexiteClass,
  parseAvancementPercent,
  Preconisation,
  PreconisationSortField,
  prioriteClass
} from '../../../core/models/preconisation.model';

export type PreconisationSortDirection = 'asc' | 'desc';

export interface PreconisationSortEvent {
  field: PreconisationSortField;
  direction: PreconisationSortDirection;
}
@Component({
  selector: 'app-preconisations-table',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './preconisations-table.html',
  styleUrl: './preconisations-table.scss'
})
export class PreconisationsTable {
  data = input<Preconisation[]>([]);
  selectedId = input<string | undefined>(undefined);
  loading = input(false);
  sortColumn = input<PreconisationSortField>('libelle');
  sortDirection = input<PreconisationSortDirection>('asc');
  rowClick = output<Preconisation>();
  sortChange = output<PreconisationSortEvent>();

  toggleSort(column: PreconisationSortField): void {
    let direction: PreconisationSortDirection = 'asc';
    if (this.sortColumn() === column) {
      direction = this.sortDirection() === 'asc' ? 'desc' : 'asc';
    }
    this.sortChange.emit({ field: column, direction });
  }

  getSortIcon(column: PreconisationSortField): string {
    if (this.sortColumn() !== column) {
      return 'unfold_more';
    }
    return this.sortDirection() === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  getAriaSort(column: PreconisationSortField): 'ascending' | 'descending' | 'none' {
    if (this.sortColumn() !== column) {
      return 'none';
    }
    return this.sortDirection() === 'asc' ? 'ascending' : 'descending';
  }

    onRowClick(item: Preconisation): void {
    this.rowClick.emit(item);
  }

  getPrioriteClass(priorite?: string): string {
    return prioriteClass(priorite);
  }

  getComplexiteClass(complexite?: string): string {
    return complexiteClass(complexite);
  }

  getAvancementClass(etatAvancement?: string): string {
    return avancementClass(etatAvancement);
  }

  getAvancementPercent(etatAvancement?: string): number | null {
    return parseAvancementPercent(etatAvancement);
  }
}



