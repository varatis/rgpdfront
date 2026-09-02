import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { KeycloakService } from '../../../../../core/auth/keycloak.service';
import { Etablissement } from '../../../../../core/models/etablissement.model';
import {
  CreateTraitementPayload,
  Traitement,
  TraitementDetails,
} from '../../../../../core/models/traitement.model';
import {
  Definition,
  DUREE_ARCHIVAGE,
  DUREE_CONSERVATION,
  Duree,
  ResponsableTraitement,
  TYPE_ETUDE_IMPACT,
  TYPE_FINALITE_PRINCIPALE,
  TYPE_LICEITE_TRAITEMENT,
  TYPE_SENSIBILITE,
} from '../../../../../core/models/referentiel.model';
import { ApiService } from '../../../../../services/api.service';

@Component({
  selector: 'app-create-traitement-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './create-traitement-modal.html',
  styleUrls: ['./create-traitement-modal.scss'],
})
export class CreateTraitementModal implements OnInit {
  private static readonly CHAMPS_REFERENTIEL = [
    'finalitePrincipale',
    'responsableTraitement',
    'sensibilite',
    'etudeImpact',
    'licieteTraitement',
    'dureeConservation',
    'dureeArchivage',
  ] as const;

  private static readonly CHAMPS_ANALYSE = [
    'impactTraitement',
    'detournementFinalite',
    'scoreDetournementFinalite',
    'collecteDcpInappropriees',
    'scoreCollecteDcpInappropriees',
    'conservationExcessiveDcp',
    'scoreConservationExcessiveDcp',
    'securisationInsuffisanteDcp',
    'scoreSecurisationInsuffisanteDcp',
    'vicesConsentement',
    'scoreVicesConsentement',
    'manqueTransparence',
    'scoreManqueTransparence',
    'incapaciteExerciceDroits',
    'scoreIncapaciteExerciceDroits',
    'transfertTiersMalEncadre',
    'scoreTransfertTiersMalEncadre',
    'transfertHorsUeAbusif',
    'scoreTransfertHorsUeAbusif',
    'defautPreuve',
    'scoreDefautPreuve',
    'scoreGlobal',
    'commentairesAnalyse',
    'expositionTraitement',
    'critereEvaluationScoring',
    'critereDecisionAutomatique',
    'critereSurveillanceSystematique',
    'critereCollecteDonneesSensibles',
    'critereCollecteLargeEchelle',
    'critereCroisementDonnees',
    'criterePersonnesVulnerables',
    'critereUsageInnovant',
    'critereExclusionBeneficeDroit',
  ] as const;

  private static readonly CHAMPS_EDITABLES = [
    'nom',
    'etablissements',
    'donneesConcernees',
    'dateIdentification',
    'finalitePrincipale',
    'dateMiseAJour',
    'historiqueModifications',
    'dataProtectionOfficer',
    'responsableTraitement',
    'gestionnaireMiseEnOeuvre',
    'sousFinalites',
    'categoriesPersonnesConcernees',
    'donneesIdentification',
    'donneesConnexion',
    'donneesLocalisation',
    'donneesComportementViePerso',
    'donneesEconomiquesFinancieres',
    'donneesProfessionnelles',
    'categoriesParticulieresDonnees',
    'sensibilite',
    'etudeImpact',
    'canauxCollecteDonnees',
    'licieteTraitement',
    'recoursTraitementAutomatises',
    'emplacementPhysique',
    'dispositionsSecuriteDonneesPhysique',
    'emplacementNumerique',
    'dispositionsSecuriteDonneesNumerique',
    'hebergement',
    'dureeConservation',
    'archivage',
    'dureeArchivage',
    'categoriesDestinataires',
    'raisonsTransfertDestinataires',
    'transfertsHorsUE',
    'paysDestinataires',
    'commentaires',
  ] as const;

  @Input() traitementToEdit: TraitementDetails | undefined;
  @Output() closed = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  isSubmitting = false;
  submitError: string | null = null;
  activeTab = 0;
  form: FormGroup;
  loading = false;
  validatorMaxLength = 255;
  validatorFinaliteMaxLength = 500;
  notificationModificationRequired = false;
  notificationModificationMandatory = false;

  clientEtablissements: Etablissement[] = [];
  etablissementInput = '';
  etablissementSuggestions: Etablissement[] = [];
  showEtablissementSuggestions = false;
  private initialEditSnapshot: string | null = null;

  get isEditMode(): boolean {
    return !!this.traitementToEdit;
  }

  readonly tabs = [
    'Identification du traitement',
    'Données personnelles traitées',
    'Description du traitement',
  ];

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private keycloakService: KeycloakService,
  ) {
    this.form = this.fb.group({
      idFonctionnel: [null],
      client: this.fb.group({
        id: [null],
        nom: [null],
        statut: [null],
      }),
      version: [null],
      nom: ['', [Validators.required, Validators.maxLength(this.validatorMaxLength)]],
      etablissements: [[] as Etablissement[]],
      donneesConcernees: [null],
      dateIdentification: [null, Validators.required],
      finalitePrincipale: [null, Validators.maxLength(this.validatorFinaliteMaxLength)],
      dateMiseAJour: [null],
      historiqueModifications: [null],
      notificationModification: [null],
      dataProtectionOfficer: [null],
      responsableTraitement: [null],
      gestionnaireMiseEnOeuvre: [null],
      sousFinalites: [null],
      categoriesPersonnesConcernees: [null],
      donneesIdentification: [null],
      donneesConnexion: [null],
      donneesLocalisation: [null],
      donneesComportementViePerso: [null],
      donneesEconomiquesFinancieres: [null],
      donneesProfessionnelles: [null],
      categoriesParticulieresDonnees: [null],
      sensibilite: [null],
      etudeImpact: [null],
      canauxCollecteDonnees: [null],
      licieteTraitement: [null],
      recoursTraitementAutomatises: [false],
      emplacementPhysique: [null],
      dispositionsSecuriteDonneesPhysique: [null],
      emplacementNumerique: [null],
      dispositionsSecuriteDonneesNumerique: [null],
      hebergement: [null],
      dureeConservation: [null],
      archivage: [false],
      dureeArchivage: [null],
      categoriesDestinataires: [null],
      raisonsTransfertDestinataires: [null],
      transfertsHorsUE: [false],
      paysDestinataires: [null],
      commentaires: [null],
    });
  }

  ngOnInit(): void {
    if (this.traitementToEdit) {
      this.form.patchValue({
        ...this.traitementToEdit,
        ...CreateTraitementModal.aplatirReferentiels(this.traitementToEdit),
        dateIdentification: this.toDateString(this.traitementToEdit.dateIdentification),
        dateMiseAJour: this.toDateString(this.traitementToEdit.dateMiseAJour),
        notificationModification: null,
      });
      this.captureInitialEditSnapshot();
    } else {
      this.apiService.getNextTraitementId().subscribe(nextId => {
        this.form.patchValue({ idFonctionnel: nextId });
      });
    }

    this.updateNotificationModificationValidation();
    this.form.valueChanges.subscribe(() => {
      this.updateNotificationModificationValidation();
    });

    const clientName = this.keycloakService.getClientName();
    if (clientName) {
      this.apiService.getClientByNom(clientName).subscribe(client => {
        this.form.patchValue({ client });
        this.apiService.getEtablissements(client.id).subscribe(etablissements => {
          this.clientEtablissements = etablissements;
        });
      });
    }
  }

  get selectedEtablissements(): Etablissement[] {
    return this.form.get('etablissements')?.value ?? [];
  }

  close(): void {
    this.closed.emit();
  }

  onEnterSubmit(event: Event): void {
    if (!(event instanceof KeyboardEvent) || event.defaultPrevented || this.shouldIgnoreEnterSubmit(event)) {
      return;
    }

    event.preventDefault();
    this.onSubmit();
  }

  onSubmit(): void {
    this.notificationModificationRequired = false;
    this.updateNotificationModificationValidation();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificationModificationRequired = this.form.get('notificationModification')?.hasError('required') ?? false;
      this.activeTab = 0;
      return;
    }

    const notificationControl = this.form.get('notificationModification');
    const notificationModification = notificationControl?.value?.trim() ?? '';

    if (this.isEditMode && this.hasEditableChanges() && !notificationModification) {
      notificationControl?.setErrors({ ...(notificationControl.errors ?? {}), required: true });
      notificationControl?.markAsTouched();
      this.notificationModificationMandatory = true;
      this.notificationModificationRequired = true;
      this.activeTab = 0;
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;

    const payload = this.buildPayload();

    const call$: Observable<Traitement | TraitementDetails> = this.isEditMode
      ? this.apiService.updateTraitement(this.traitementToEdit!.idFonctionnel, payload).pipe(
          switchMap(resultat => {
            if (!notificationModification) {
              return of(resultat);
            }

            return this.apiService
              .addTraitementHistorique(this.traitementToEdit!.idFonctionnel, { motif: notificationModification })
              .pipe(switchMap(() => of(resultat)));
          }),
        )
      : this.apiService.createTraitement(payload);

    call$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.snackBar.open(
          this.isEditMode ? 'Traitement modifié avec succès' : 'Traitement créé avec succès',
          'OK',
          {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['snackbar-success'],
          },
        );

        if (this.isEditMode) {
          this.updated.emit();
        } else {
          this.created.emit();
        }

        this.closed.emit();
      },
      error: err => {
        console.error(err);
        this.isSubmitting = false;
        this.submitError = 'Une erreur est survenue. Veuillez réessayer.';
        this.snackBar.open(
          this.isEditMode
            ? 'Erreur lors de la modification du traitement'
            : 'Erreur lors de la création du traitement',
          'Fermer',
          {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['snackbar-error'],
          },
        );
      },
    });
  }

  onEtablissementInputChange(value: string): void {
    this.etablissementInput = value;
    const query = value.trim().toLowerCase();
    const selected = this.selectedEtablissements;

    this.etablissementSuggestions = query
      ? this.clientEtablissements.filter(
          e => e.nom.toLowerCase().includes(query) && !selected.some(s => this.isSameEtablissement(s, e)),
        )
      : this.clientEtablissements.filter(e => !selected.some(s => this.isSameEtablissement(s, e)));

    this.showEtablissementSuggestions = true;
  }

  onEtablissementInputFocus(): void {
    this.onEtablissementInputChange(this.etablissementInput);
  }

  onEtablissementInputBlur(): void {
    setTimeout(() => (this.showEtablissementSuggestions = false), 150);
  }

  get etablissementExactMatchExists(): boolean {
    const query = this.etablissementInput.trim().toLowerCase();
    if (!query) return true;

    return (
      this.selectedEtablissements.some(e => e.nom.trim().toLowerCase() === query) ||
      this.clientEtablissements.some(e => e.nom.trim().toLowerCase() === query)
    );
  }

  selectEtablissement(etablissement: Etablissement): void {
    this.form.get('etablissements')?.setValue([...this.selectedEtablissements, etablissement]);
    this.etablissementInput = '';
    this.showEtablissementSuggestions = false;
  }

  createEtablissement(): void {
    const nom = this.etablissementInput.trim();
    if (!nom || this.etablissementExactMatchExists) return;

    this.form.get('etablissements')?.setValue([...this.selectedEtablissements, { nom }]);
    this.etablissementInput = '';
    this.showEtablissementSuggestions = false;
  }

  onEtablissementInputEnter(): void {
    if (this.etablissementSuggestions.length > 0) {
      this.selectEtablissement(this.etablissementSuggestions[0]);
    } else {
      this.createEtablissement();
    }
  }

  removeEtablissement(etablissement: Etablissement): void {
    this.form.get('etablissements')?.setValue(
      this.selectedEtablissements.filter(e => !this.isSameEtablissement(e, etablissement)),
    );
  }

  invalidStatusCause(field: string): string | undefined {
    const control = this.form.get(field);
    if (!control?.invalid) return undefined;

    return control.hasError('required')
      ? 'Ce champ est requis.'
      : control.hasError('maxlength')
        ? `La limite de caractères de ce champ est dépassée (${control.value.length}/${field === 'finalitePrincipale' ? this.validatorFinaliteMaxLength : this.validatorMaxLength})`
        : undefined;
  }

  notificationModificationError(): string {
    return this.notificationModificationRequired
      ? 'Le champ Motif de modifications est requis si vous modifiez le formulaire.'
      : '';
  }

  private updateNotificationModificationValidation(): void {
    const control = this.form.get('notificationModification');
    if (!control) {
      return;
    }

    this.notificationModificationMandatory = this.isEditMode && this.hasEditableChanges();
    control.setValidators(
      this.notificationModificationMandatory ? [CreateTraitementModal.trimmedRequiredValidator] : []
    );
    control.updateValueAndValidity({ emitEvent: false });

    if (!this.notificationModificationMandatory || !control.hasError('required')) {
      this.notificationModificationRequired = false;
    }
  }

  private static trimmedRequiredValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (typeof value === 'string') {
      return value.trim() ? null : { required: true };
    }

    return value == null ? { required: true } : null;
  }

  private static aplatirReferentiels(traitement: TraitementDetails): Record<string, string | null> {
    return Object.fromEntries(
      CreateTraitementModal.CHAMPS_REFERENTIEL.map(champ => [champ, traitement[champ]?.valeur ?? null]),
    );
  }

  private buildPayload(): CreateTraitementPayload {
    const {
      finalitePrincipale,
      responsableTraitement,
      sensibilite,
      etudeImpact,
      licieteTraitement,
      dureeConservation,
      dureeArchivage,
      notificationModification,
      ...reste
    } = this.form.value;

    return {
      ...reste,
      ...this.readonlyAnalysisPayload(),
      finalitePrincipale: this.toDefinition(finalitePrincipale, TYPE_FINALITE_PRINCIPALE),
      responsableTraitement: this.toResponsableTraitement(responsableTraitement),
      sensibilite: this.toDefinition(sensibilite, TYPE_SENSIBILITE),
      etudeImpact: this.toDefinition(etudeImpact, TYPE_ETUDE_IMPACT),
      licieteTraitement: this.toDefinition(licieteTraitement, TYPE_LICEITE_TRAITEMENT),
      dureeConservation: this.toDuree(dureeConservation, DUREE_CONSERVATION),
      dureeArchivage: this.toDuree(dureeArchivage, DUREE_ARCHIVAGE),
    };
  }

  private readonlyAnalysisPayload(): Partial<CreateTraitementPayload> {
    if (!this.traitementToEdit) {
      return {};
    }

    return Object.fromEntries(
      CreateTraitementModal.CHAMPS_ANALYSE.map(champ => [champ, this.traitementToEdit?.[champ] ?? null]),
    ) as Partial<CreateTraitementPayload>;
  }

  private captureInitialEditSnapshot(): void {
    this.initialEditSnapshot = this.computeEditableSnapshot();
  }

  private hasEditableChanges(): boolean {
    return this.initialEditSnapshot !== null && this.initialEditSnapshot !== this.computeEditableSnapshot();
  }

  private computeEditableSnapshot(): string {
    const raw = this.form.getRawValue();

    const normalized = Object.fromEntries(
      CreateTraitementModal.CHAMPS_EDITABLES.map(champ => [champ, this.normalizeSnapshotValue(raw[champ])]),
    );

    return JSON.stringify(normalized);
  }

  private normalizeSnapshotValue(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value
        .map(item => {
          if (item && typeof item === 'object') {
            const etablissement = item as Etablissement;
            return (etablissement.id ?? etablissement.nom ?? '').toString().trim().toLowerCase();
          }
          return String(item ?? '').trim().toLowerCase();
        })
        .sort();
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed === '' ? null : trimmed;
    }

    return value ?? null;
  }

  private shouldIgnoreEnterSubmit(event: KeyboardEvent): boolean {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    const tagName = target.tagName.toLowerCase();
    if (tagName === 'textarea') {
      return true;
    }

    if (tagName === 'button') {
      return true;
    }

    if (tagName === 'input') {
      const inputType = (target as HTMLInputElement).type?.toLowerCase();
      return inputType === 'checkbox';
    }

    return false;
  }

  private isSameEtablissement(a: Etablissement, b: Etablissement): boolean {
    return a.id != null && b.id != null
      ? a.id === b.id
      : a.nom.trim().toLowerCase() === b.nom.trim().toLowerCase();
  }

  private toDateString(date: Date | string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return Number.isNaN(d.getTime()) ? '' : d.toISOString().substring(0, 10);
  }

  private toDefinition(valeur: string | null | undefined, type: string): Definition | null {
    return valeur?.trim() ? { type, valeur: valeur.trim() } : null;
  }

  private toDuree(valeur: string | null | undefined, estArchivage: boolean): Duree | null {
    return valeur?.trim() ? { estArchivage, valeur: valeur.trim() } : null;
  }

  private toResponsableTraitement(valeur: string | null | undefined): ResponsableTraitement | null {
    return valeur?.trim() ? { valeur: valeur.trim() } : null;
  }
}
