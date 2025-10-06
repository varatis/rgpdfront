export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'outline' 
  | 'ghost' 
  | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonConfig {
  variant: ButtonVariant;
  size: ButtonSize;
  disabled: boolean;
  loading: boolean;
  fullWidth: boolean;
  icon?: string;
  iconPosition: 'left' | 'right';
}