import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableItem {
  id: number;
  treatment: string;
  manager: string;
  purpose: string;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.html',
  styleUrls: ['./table.scss']
})
export class Table {
  @Input() data: TableItem[] = [];
  @Input() selectedId?: number;
  @Output() select = new EventEmitter<TableItem>();
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';


    get sortedData(): TableItem[] {
    if (!this.sortColumn) return this.data;
    return [...this.data].sort((a, b) => {
      const valA = (a as any)[this.sortColumn];
      const valB = (b as any)[this.sortColumn];
      if (this.sortColumn === 'id') {
        return this.sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      
      const compare = valA.toString().localeCompare(valB.toString());
      return this.sortDirection === 'asc' ? compare : -compare;
    });
  }

  toggleSort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }
  onSelect(item: TableItem) {
    this.select.emit(item);
  }
}