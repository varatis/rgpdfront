export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  dataType?: 'text' | 'number' | 'date' | 'boolean' | 'action';
}

export interface TableAction {
  name: string;
  label: string;
  icon?: string;
  color?: 'primary' | 'secondary' | 'danger' | 'warning';
  condition?: (item: any) => boolean;
}