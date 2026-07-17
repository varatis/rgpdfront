import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Traitement } from '../../../../../core/models/traitement.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-table-traitement',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './table-traitement.html',
  styleUrls: ['./table-traitement.scss']
})
export class TableTraitement {
  @Input() data: Traitement[] = [];
  @Input() selectedId?: number;
  @Input() loading = false;
  @Output() select = new EventEmitter<Traitement>();
  @Output() sortChange = new EventEmitter<{ field: string; direction: 'asc' | 'desc' }>();
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  toggleSort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sortChange.emit({ field: this.sortColumn, direction: this.sortDirection });
  }
  onSelect(item: Traitement) {
    this.select.emit(item);
  }
}
