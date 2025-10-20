import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './filter-panel.html',
  styleUrl: './filter-panel.scss'
})
export class FilterPanel {
  @Input() visible = false;
  @Input() placeholder = '';
  @Output() searchChange = new EventEmitter<string>();

  onSearch(event: any) {
    this.searchChange.emit(event.target.value);
  }
}
