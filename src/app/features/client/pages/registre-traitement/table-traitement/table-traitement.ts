import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Traitement } from '../../../../../core/models/traitement.model';

@Component({
  selector: 'app-table-traitement',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-traitement.html',
  styleUrls: ['./table-traitement.scss'] 
})
export class TableTraitement {
  @Input() data: Traitement[] = [];
  @Input() selectedId?: number;
  @Output() select = new EventEmitter<Traitement>();
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';


    get sortedData(): Traitement[] {
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
  onSelect(item: Traitement) {
    this.select.emit(item);
  }
}