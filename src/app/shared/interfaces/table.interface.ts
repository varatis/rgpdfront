export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  dataType?: 'string' | 'number' | 'date' | 'boolean';
}

export interface TableAction {
  name: string;
  label: string;
  icon?: string;
  color?: 'primary' | 'secondary' | 'danger' | 'warning';
  condition?: (item: any) => boolean;
}