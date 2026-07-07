import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-treatment-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './treatmentTabs.html',
  styleUrls: ['./treatmentTabs.scss']
})
export class TreatmentTabsComponent {
  @Input() treatment: any;
  @Input() userRole: 'client' | 'admin' | 'superadmin' = 'client';
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

    if (this.userRole === 'client') {
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
