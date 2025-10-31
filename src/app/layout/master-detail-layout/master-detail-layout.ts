import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Header, HeaderAction } from "../../shared/components/header/header";

import { PageTabsComponent, PageTab } from '../../shared/components/page-tabs/page-tab/page-tab';
import { CommonModule } from '@angular/common';
export interface Tab {
  key: string;
  label: string;
  count: number;
}
@Component({
  selector: 'app-master-detail-layout',
  imports: [CommonModule,Header],
  templateUrl: './master-detail-layout.html',
  styleUrl: './master-detail-layout.scss'
})
export class MasterDetailLayout {
@Input() title: string = '';
  @Input() iconSvg: string = ''; 
  @Input() actions: HeaderAction[] = [];
  @Output() actionClick = new EventEmitter<string>();

  @Input() tabs: PageTab[] = []; 
  @Input() activeTabKey: string = '';
  @Output() tabChange = new EventEmitter<string>();

  
  @Input() isDetailOpen: boolean = false;
  @Input() detailTitle: string = 'Détails';
  @Input() isEmpty: boolean = false;
  @Input() isLoading: boolean = false; 
  @Output() detailClose = new EventEmitter<void>();

  // --- Helpers pour le template ---
  // (Vous aurez besoin de votre DomSanitizer ici pour les SVG)
  // constructor(private sanitizer: DomSanitizer) {}
  // getSafeSvg(svg: string) { ... }

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
