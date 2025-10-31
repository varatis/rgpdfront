import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Treatment } from '../../interfaces/treatment.interface';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;     
  label: string;   
  width?: string;   
  sortable?: boolean; 
}
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
  @Input() trackKey: string = 'id';
  
  @Output() rowClick = new EventEmitter<any>();

  onRowClick(row: any) {
    this.rowClick.emit(row);
  }
}
