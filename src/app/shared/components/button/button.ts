import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  disabled = input(false);
  loading = input(false);
  icon = input<string>();
  iconPosition = input<'left' | 'right'>('left');
  fullWidth = input(false);
  type = input<'button' | 'submit' | 'reset'>('button');

  clicked = output<Event>();

  get color(): string {
    switch (this.variant()) {
      case 'primary': return 'primary';
      case 'secondary': return 'accent';
      case 'danger': return 'warn';
      default: return '';
    }
  }

  get isOutline(): boolean { return this.variant() === 'outline'; }
  get isGhost(): boolean { return this.variant() === 'ghost'; }
}
