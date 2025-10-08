import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TableColumn } from '../../interfaces/table.interface';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
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
