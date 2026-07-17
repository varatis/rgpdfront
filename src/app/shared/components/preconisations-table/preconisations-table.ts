import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
interface PreconisationRow {
  id: string;
  titre: string;
  priorite: string;
  prioriteLabel: string;
  complexite: string;
  complexiteLabel: string;
  avancement: number;
  _raw?: any;
}
@Component({
  selector: 'app-preconisations-table',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './preconisations-table.html',
  styleUrl: './preconisations-table.scss'
})
export class PreconisationsTable {
@Input() data: PreconisationRow[] = [];
@Output() rowClick = new EventEmitter<any>();

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  get sortedData(): PreconisationRow[] {
    if (!this.sortColumn) return this.data;

    return [...this.data].sort((a, b) => {
      const valA = (a as any)[this.sortColumn];
      const valB = (b as any)[this.sortColumn];

      const compare = valA.toString().localeCompare(valB.toString());
      return this.sortDirection === 'asc' ? compare : -compare;
    });
  }

  toggleSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  onRowClick(item: PreconisationRow): void {
    this.rowClick.emit(item);
  }

  getPrioriteClass(priorite: string): string {
    const classes: { [key: string]: string } = {
      'tres-urgent': 'badge-danger',
      'urgent': 'badge-alert',
      'normal': 'badge-info'
    };
    return classes[priorite] || 'badge-info';
  }

  getComplexiteClass(complexite: string): string {
    const classes: { [key: string]: string } = {
      'moyennement-complexe': 'badge-alert',
      'tres-simple': 'badge-warning',
      'complexe': 'badge-danger'
    };
    return classes[complexite] || 'badge-info';
  }
}



