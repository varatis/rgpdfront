import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './card.html',
  styleUrl: './card.scss'
})
export class Card {
  @Input() title = '';
  @Input() padding = true;
}
