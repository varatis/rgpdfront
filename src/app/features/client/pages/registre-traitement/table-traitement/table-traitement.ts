import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { Traitement } from '../../../../../core/models/traitement.model';
import { MatIconModule } from '@angular/material/icon';

export type SortColumn = 'idFonctionnel' | 'nom' | 'gestionnaireMiseEnOeuvre' | 'finalitePrincipale' | null;
export type SortDirection = 'asc' | 'desc';
export interface SortEvent { field: SortColumn; direction: SortDirection; }

@Component({
  selector: 'app-table-traitement',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './table-traitement.html',
  styleUrls: ['./table-traitement.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableTraitement {
  data = input<Traitement[]>([]);
  selectedId = input<number | undefined>(undefined);
  loading = input(false);
  sortColumn = input<SortColumn>(null);
  sortDirection = input<SortDirection>('asc');
  select = output<Traitement>();
  sortChange = output<SortEvent>();


  toggleSort(column: SortColumn) {
    let newDirection: SortDirection = 'asc';
    if (this.sortColumn() === column) {
      newDirection = this.sortDirection() === 'asc' ? 'desc' : 'asc';
    }
    this.sortChange.emit({ field: column, direction: newDirection });
  }

  getSortIcon(column: SortColumn): string {
    if (this.sortColumn() !== column) return 'unfold_more';
    return this.sortDirection() === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  getAriaSort(column: SortColumn): 'ascending' | 'descending' | 'none' {
    if (this.sortColumn() !== column) return 'none';
    return this.sortDirection() === 'asc' ? 'ascending' : 'descending';
  }

  onSelect(item: Traitement) {
    this.select.emit(item);
  }
}
