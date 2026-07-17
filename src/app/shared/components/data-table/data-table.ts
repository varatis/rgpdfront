import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  sortable?: boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTable {
  columns = input.required<TableColumn[]>();
  data = input.required<any[]>();
  trackKey = input<string>('id');
  rowClick = output<any>();
}
