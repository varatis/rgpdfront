import { Component, EventEmitter, Input } from '@angular/core';
import { Output } from '@angular/core';
import { CommonModule } from '@angular/common';
export interface Treatment {
  id: number;
  treatment: string;
  manager: string;
  purpose: string;
}
@Component({
  selector: 'app-detail-view',
  imports: [CommonModule],
  templateUrl: './detail-view.html',
  styleUrl: './detail-view.scss'
})
export class DetailView {
 @Input() treatment!: Treatment;
  @Output() close = new EventEmitter<void>();

  tabs: string[] = [
    'Identification', 
    'Données personnelles traitées', 
    'Description du traitement'
  ];
  activeTab: string = this.tabs[0];
}
