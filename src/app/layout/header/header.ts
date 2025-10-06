import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
 @Input() title = '';
  @Input() subtitle?: string;
  @Input() showBackButton = false;
  @Output() back = new EventEmitter<void>();

  onBack(): void {
    this.back.emit();
  }
}
