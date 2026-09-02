import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { Header, HeaderAction } from '../../shared/components/header/header';
import { PageTab } from '../../shared/components/page-tabs/page-tab/page-tab';

@Component({
  selector: 'app-master-detail-layout',
  imports: [Header, MatIconModule],
  templateUrl: './master-detail-layout.html',
  styleUrl: './master-detail-layout.scss'
})
export class MasterDetailLayout {
  @Input() title: string = '';
  @Input() iconSvg: string = '';
  @Input() icon: string = '';
  @Input() actions: HeaderAction[] = [];
  @Output() actionClick = new EventEmitter<string>();

  @Input() tabs: PageTab[] = [];
  @Input() activeTabKey: string = '';
  @Output() tabChange = new EventEmitter<string>();

  @Input() isDetailOpen: boolean = false;
  @Input() detailTitle: string = 'Détails';
  @Input() isEmpty: boolean = false;
  @Input() hideDetailHeader = false;
  @Input() isLoading: boolean = false;
  @Output() detailClose = new EventEmitter<void>();

  onHeaderAction(action: string) {
    this.actionClick.emit(action);
  }

  onSelectTab(key: string) {
    this.tabChange.emit(key);
  }

  onCloseDetail() {
    this.detailClose.emit();
  }
}
