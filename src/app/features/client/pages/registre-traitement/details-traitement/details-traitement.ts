import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-details-traitement',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './details-traitement.html',
  styleUrls: ['./details-traitement.scss']
})
export class DetailsTraitementComponent {
  @Input() traitement: any;
  @Input() userRole: 'client' | 'user' = 'client';
  activeTab = 'Identification du traitement';
  
  tabs: string[] = []; 

  private readonly clientTabs = [
    'Identification du traitement',
    'Données personnelles traitées',
    'Description du traitement',
    'Analyse de conformité'
  ];

  private readonly userTabs = [
    'Identification du traitement',
    'Données personnelles traitées',
    'Description du traitement'
  ];

  ngOnInit() {
    
    if (this.userRole === 'user') {
      this.tabs = this.userTabs;
    } else {
      
      this.tabs = this.clientTabs;
    }
    
   
    if (!this.tabs.includes(this.activeTab)) {
      this.activeTab = this.tabs[0];
    }
  }

  selectTab(tab: string) {
    this.activeTab = tab;
  }
}