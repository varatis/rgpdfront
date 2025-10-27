import { TemplateRef } from "@angular/core";

export interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  template?: TemplateRef<any>;
}

export interface TableAction {
  icon: string;
  label: string;
  callback: (row: any) => void;
}