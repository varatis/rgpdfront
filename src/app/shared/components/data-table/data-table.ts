import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TableAction, TableColumn } from '../../interfaces/table.interface';
import { Treatment } from '../../interfaces/treatment.interface';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss'
})
export class DataTable {
 @Input() data: Treatment[] = [];
  @Input() loading = false;
  @Output() rowClick = new EventEmitter<Treatment>();

  onRowClick(item: Treatment) {
    this.rowClick.emit(item);
  }
}
