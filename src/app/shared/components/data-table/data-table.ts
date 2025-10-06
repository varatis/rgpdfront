import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Button } from '../button/button';
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-data-table',
  imports: [Button, CommonModule],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss'
})
export class DataTable {
@Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() showActions = false;
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  onEdit(item: any): void {
    this.edit.emit(item);
  }

  onDelete(item: any): void {
    this.delete.emit(item);
  }
}
