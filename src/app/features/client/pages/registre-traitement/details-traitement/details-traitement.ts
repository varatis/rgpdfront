import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../../services/api.service';
import { TraitementDetails } from '../../../../../core/models/traitement.model';
import { delay } from 'rxjs';

@Component({
  selector: 'app-details-traitement',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './details-traitement.html',
  styleUrls: ['./details-traitement.scss']
})
export class DetailsTraitementComponent implements OnChanges {
  constructor(private apiService: ApiService) { }
  @Input() traitementId: number | undefined;
  @Input() userRole: 'client' | 'user' = 'client';
  traitementDetails: TraitementDetails | undefined;
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['traitementId'] && this.traitementId) {
      this.loadTraitementDetails(this.traitementId);
    }

    if (this.userRole === 'user') {
      this.tabs = this.userTabs;
    } else {

      this.tabs = this.clientTabs;
    }


    if (!this.tabs.includes(this.activeTab)) {
      this.activeTab = this.tabs[0];
    }
  }

  loadTraitementDetails(traitementId: number | undefined): void {
    this.traitementDetails = undefined;
    this.apiService.getTraitementDetails(traitementId)
      .subscribe({
        next: (res) => {
          this.traitementDetails = res;
        },
        error: (err) => console.error(err)
      });
  }

  selectTab(tab: string, event: MouseEvent) {
    this.activeTab = tab;
    (event.target as HTMLElement).scrollIntoView({
      behavior: 'smooth',
      inline: 'nearest',
      block:'nearest'
    });
  }
}