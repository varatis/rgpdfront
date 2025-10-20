export interface HeaderAction {
  label: string;
  icon: string;
  action: string;
  visible?: boolean;
  color?: 'default' | 'primary' | 'danger';
}