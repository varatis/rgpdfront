import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { ApiService } from '../../../../../services/api.service';
import { TraitementDetails } from '../../../../../core/models/traitement.model';
import { BoolFrPipe } from './bool-fr.pipe';
import { DateFrPipe } from './date-fr.pipe';
import { ALL_TABS, TabConfig } from './field-config';
import { NlToBrPipe } from './nl-to-br.pipe';

type UserRole = 'client' | 'admin' | 'superadmin';

interface HistoryEntryView {
  date: string;
  field: string;
  change: string;
}

@Component({
  selector: 'app-details-traitement',
  standalone: true,
  imports: [CommonModule, NlToBrPipe, DateFrPipe, BoolFrPipe],
  templateUrl: './details-traitement.html',
  styleUrls: ['./details-traitement.scss'],
})
export class DetailsTraitementComponent {
  private readonly apiService = inject(ApiService);
  private readonly historyDateFormatter = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  private static readonly HISTORY_FIELD_LABELS: Record<string, string> = {
    nom: 'Nom du traitement',
    dateIdentification: "Date d'identification",
    dateMiseAJour: 'Date de mise à jour',
    donneesConcernees: 'Données concernées',
    finalitePrincipale: 'Finalité principale',
    historiqueModifications: 'Historique importé',
    dataProtectionOfficer: 'Data Protection Officer',
    responsableTraitement: 'Responsable de traitement',
    gestionnaireMiseEnOeuvre: 'Gestionnaire de la mise en œuvre',
    sousFinalites: 'Sous-finalités',
    categoriesPersonnesConcernees: 'Catégories de personnes concernées',
    donneesIdentification: "Données d'identification",
    donneesConnexion: 'Données de connexion',
    donneesLocalisation: 'Données de localisation',
    donneesComportementViePerso: 'Données comportement / vie personnelle',
    donneesEconomiquesFinancieres: 'Données économiques et financières',
    donneesProfessionnelles: 'Données professionnelles',
    categoriesParticulieresDonnees: 'Catégories particulières de données',
    sensibilite: 'Sensibilité',
    etudeImpact: "Étude d'impact",
    canauxCollecteDonnees: 'Canaux de collecte des données',
    licieteTraitement: 'Licéité du traitement',
    recoursTraitementAutomatises: 'Recours aux traitements automatisés',
    emplacementPhysique: 'Emplacement physique',
    dispositionsSecuriteDonneesPhysique: 'Sécurité des données (physique)',
    emplacementNumerique: 'Emplacement numérique',
    dispositionsSecuriteDonneesNumerique: 'Sécurité des données (numérique)',
    hebergement: 'Hébergement',
    dureeConservation: 'Durée de conservation',
    archivage: 'Archivage',
    dureeArchivage: "Durée d'archivage",
    categoriesDestinataires: 'Catégories de destinataires',
    raisonsTransfertDestinataires: 'Raisons du transfert',
    transfertsHorsUE: 'Transferts hors UE',
    paysDestinataires: 'Pays destinataires',
    commentaires: 'Commentaires',
    etablissements: 'Établissement(s)',
  };

  readonly traitementId = input<number>();
  readonly refreshToken = input<number>(0);
  readonly userRole = input<UserRole>('client');
  readonly detailsLoaded = output<TraitementDetails>();

  readonly details = signal<TraitementDetails | undefined>(undefined);
  readonly activeTab = signal('Identification du traitement');

  readonly tabs = computed<TabConfig[]>(() =>
    this.userRole() === 'client'
      ? ALL_TABS.filter(tab => tab.name !== 'Analyse de conformité')
      : ALL_TABS
  );

  readonly activeTabConfig = computed(() =>
    this.tabs().find(tab => tab.name === this.activeTab())
  );

  readonly historiqueEntries = computed<HistoryEntryView[]>(() => {
    const details = this.details();
    if (!details) {
      return [];
    }

    const entries = (details.historiqueTraitement ?? []).flatMap(entree => {
      const date = this.formatHistoriqueDate(entree?.date) || '—';
      return this.parseHistoryMotif(entree?.motif, date);
    });

    const historiqueImporte = details.historiqueModifications?.trim();
    if (historiqueImporte) {
      entries.push(...this.parseImportedHistory(historiqueImporte));
    }

    return entries;
  });

  constructor() {
    effect((onCleanup) => {
      const id = this.traitementId();
      this.refreshToken();

      if (id == null) {
        this.details.set(undefined);
        return;
      }

      this.details.set(undefined);
      const subscription = this.apiService.getTraitementDetails(id).subscribe({
        next: (res) => {
          this.details.set(res);
          this.detailsLoaded.emit(res);
        },
        error: (err) => console.error(err),
      });

      onCleanup(() => subscription.unsubscribe());
    });

    effect(() => {
      if (!this.tabs().some(tab => tab.name === this.activeTab())) {
        this.activeTab.set(this.tabs()[0]?.name ?? '');
      }
    });
  }

  fieldValue(key: string): string | null | undefined {
    const details = this.details();
    if (!details) {
      return undefined;
    }

    const value = key.split('.').reduce<unknown>(
      (current, segment) =>
        current == null ? current : (current as Record<string, unknown>)[segment],
      details,
    );
    if (value == null) {
      return value;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    return String(value);
  }

  customValue(getter: string): string {
    switch (getter) {
      case 'etablissementsDisplay':
        return this.etablissementsDisplay;
      default:
        return '-';
    }
  }

  get etablissementsDisplay(): string {
    const list = this.details()?.etablissements;
    return list?.length ? list.map(etablissement => etablissement.nom).join('\n') : '-';
  }

  selectTab(tab: string, event: MouseEvent): void {
    this.activeTab.set(tab);
    (event.target as HTMLElement).scrollIntoView({
      behavior: 'smooth',
      inline: 'nearest',
      block: 'nearest',
    });
  }

  private parseHistoryMotif(motif: string | null | undefined, date: string): HistoryEntryView[] {
    const cleanMotif = motif?.trim();
    if (!cleanMotif) {
      return [];
    }

    return cleanMotif
      .split(/(?:\r?\n|\s;\s)/g)
      .map(part => part.trim())
      .filter(Boolean)
      .map(part => this.mapHistoryPart(part, date));
  }

  private mapHistoryPart(part: string, date: string): HistoryEntryView {
    const match = /^(?<field>[^:]+)\s*:\s*«\s*(?<from>.*?)\s*»\s*→\s*«\s*(?<to>.*?)\s*»$/u.exec(part);

    if (!match?.groups) {
      return {
        date,
        field: 'Modification',
        change: part,
      };
    }

    const rawField = match.groups['field'].trim();
    const from = this.prettyHistoryValue(match.groups['from']);
    const to = this.prettyHistoryValue(match.groups['to']);

    return {
      date,
      field: this.prettyHistoryField(rawField),
      change: `${from} → ${to}`,
    };
  }

  private parseImportedHistory(historiqueImporte: string): HistoryEntryView[] {
    return historiqueImporte
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => ({
        date: 'Import',
        field: 'Historique importé',
        change: line,
      }));
  }

  private prettyHistoryField(rawField: string): string {
    return DetailsTraitementComponent.HISTORY_FIELD_LABELS[rawField]
      ?? rawField.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  private prettyHistoryValue(value: string | null | undefined): string {
    const clean = value?.trim();
    if (!clean) {
      return 'vide';
    }

    if (clean === 'true') {
      return 'Oui';
    }

    if (clean === 'false') {
      return 'Non';
    }

    return clean;
  }

  private formatHistoriqueDate(value: string | Date | null | undefined): string {
    if (!value) {
      return '';
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return this.historyDateFormatter.format(date);
  }
}
