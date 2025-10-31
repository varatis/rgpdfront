import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
export interface PageTab {
  key: string;
  label: string;
  count: number;
}
@Component({
  selector: 'app-page-tabs',
  imports: [CommonModule],
template: `<div class="tabs-header">
      @for (tab of tabs; track tab.key) {
        <button
          class="tab-btn"
          [class.active]="activeTabKey === tab.key"
          (click)="onSelectTab(tab.key)">
          {{ tab.label }} ({{ tab.count }})
        </button>
      }
    </div>
  `,
styleUrls: ['./page-tab.scss']
    }
  )

export class PageTabsComponent { 
  @Input() tabs: PageTab[] = [];
  @Input() activeTabKey: string = '';
  @Output() tabChange = new EventEmitter<string>();

  onSelectTab(key: string) {
    if (key !== this.activeTabKey) {
      this.tabChange.emit(key);
    }
  }
}
