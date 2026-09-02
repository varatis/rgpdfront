import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../../../services/api.service';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CreateTraitementPayload, Traitement, TraitementDetails } from '../../../../../core/models/traitement.model';
import { Etablissement } from '../../../../../core/models/etablissement.model';
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
import { KeycloakService } from '../../../../../core/auth/keycloak.service';

@Component({
  selector: 'app-create-traitement-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './create-traitement-modal.html',
  styleUrls: ['./create-traitement-modal.scss'],
})
export class CreateTraitementModal implements OnInit {
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

  // Etablissements — chip input with autocomplete
  clientEtablissements: Etablissement[] = [];
  etablissementInput = '';
  etablissementSuggestions: Etablissement[] = [];
  showEtablissementSuggestions = false;

  get isEditMode(): boolean {
    return !!this.traitementToEdit;
  }

  readonly tabs = [
    'Identification du traitement',
    'Données personnelles traitées',
    'Description du traitement',
  ];

  constructor(private apiService: ApiService, private fb: FormBuilder, private snackBar: MatSnackBar,
    private keycloakService: KeycloakService) {
    this.form = this.fb.group({
      idFonctionnel: [null],
      client: this.fb.group({
        id: [null],
        nom: [null],
        statut: [null]
      }),
      version: [null],
      // Tab 1 — Identification
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
      // Tab 2 — Données personnelles
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
      // Tab 3 — Description
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
      // Mode Edition
      this.form.patchValue({
        ...this.traitementToEdit,
        ...CreateTraitementModal.aplatirReferentiels(this.traitementToEdit),
        dateIdentification: this.toDateString(this.traitementToEdit.dateIdentification),
        dateMiseAJour: this.toDateString(this.traitementToEdit.dateMiseAJour),
      });
    } else {
      // Mode création
      // Récupération de l'id fonctionnel suivant
      this.apiService.getNextTraitementId().subscribe(nextId => {
        this.form.patchValue({
          idFonctionnel: nextId
        });
      });
    }

    // Récupération du client associé à l'utilisateur connecté (groupe Keycloak "/clients/<nom>")
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

  private isSameEtablissement(a: Etablissement, b: Etablissement): boolean {
    return a.id != null && b.id != null
      ? a.id === b.id
      : a.nom.trim().toLowerCase() === b.nom.trim().toLowerCase();
  }

  onEtablissementInputChange(value: string): void {
    this.etablissementInput = value;
    const query = value.trim().toLowerCase();
    const selected = this.selectedEtablissements;

    this.etablissementSuggestions = query
      ? this.clientEtablissements.filter(e =>
          e.nom.toLowerCase().includes(query) &&
          !selected.some(s => this.isSameEtablissement(s, e))
        )
      : this.clientEtablissements.filter(e => !selected.some(s => this.isSameEtablissement(s, e)));

    this.showEtablissementSuggestions = true;
  }

  onEtablissementInputFocus(): void {
    this.onEtablissementInputChange(this.etablissementInput);
  }

  onEtablissementInputBlur(): void {
    // Delay so a click on a suggestion/create option registers before the list disappears
    setTimeout(() => (this.showEtablissementSuggestions = false), 150);
  }

  get etablissementExactMatchExists(): boolean {
    const query = this.etablissementInput.trim().toLowerCase();
    if (!query) return true;
    return this.selectedEtablissements.some(e => e.nom.trim().toLowerCase() === query) ||
      this.clientEtablissements.some(e => e.nom.trim().toLowerCase() === query);
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
      this.selectedEtablissements.filter(e => !this.isSameEtablissement(e, etablissement))
    );
  }

  private toDateString(date: Date | string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return isNaN(d.getTime()) ? '' : d.toISOString().substring(0, 10);
  }

  close(): void {
    this.closed.emit();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.activeTab = 0; // all required fields are on tab 1
      return;
    }
    this.isSubmitting = true;
    this.submitError = null;

    const payload = this.buildPayload();
    const notificationModification = this.form.get('notificationModification')?.value?.trim();

    const call$: Observable<Traitement | TraitementDetails> = this.isEditMode
      ? this.apiService.updateTraitement(
        this.traitementToEdit!.idFonctionnel,
        payload
      ).pipe(
        switchMap((resultat) => {
          if (!notificationModification) {
            return of(resultat);
          }

          return this.apiService.addTraitementHistorique(
            this.traitementToEdit!.idFonctionnel,
            { motif: notificationModification }
          ).pipe(switchMap(() => of(resultat)));
        })
      )
      : this.apiService.createTraitement(payload);

    call$.subscribe({
      next: () => {
        this.isSubmitting = false;

        this.snackBar.open(
          this.isEditMode
            ? 'Traitement modifié avec succès'
            : 'Traitement créé avec succès',
          'OK',
          {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',

            panelClass: ['snackbar-success']
          }
        );

        if (this.isEditMode) {
          this.updated.emit();
        } else {
          this.created.emit();
        }

        this.closed.emit();
      },

      error: (err) => {
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

            panelClass: ['snackbar-error']
          }
        );
      },
    });
  }

  /**
   * Champs adossés à un référentiel du client : le back les échange sous forme
   * d'objet alors que le formulaire les saisit en texte libre.
   */
  private static readonly CHAMPS_REFERENTIEL = [
    'finalitePrincipale',
    'responsableTraitement',
    'sensibilite',
    'etudeImpact',
    'licieteTraitement',
    'dureeConservation',
    'dureeArchivage',
  ] as const;

  /** Objet du back → valeur textuelle affichée dans le formulaire. */
  private static aplatirReferentiels(traitement: TraitementDetails): Record<string, string | null> {
    return Object.fromEntries(
      CreateTraitementModal.CHAMPS_REFERENTIEL.map(champ => [champ, traitement[champ]?.valeur ?? null])
    );
  }

  /** Valeur textuelle du formulaire → objet attendu par le back. */
  private buildPayload(): CreateTraitementPayload {
    const {
      finalitePrincipale, responsableTraitement, sensibilite, etudeImpact,
      licieteTraitement, dureeConservation, dureeArchivage, notificationModification, ...reste
    } = this.form.value;

    return {
      ...reste,
      finalitePrincipale: this.toDefinition(finalitePrincipale, TYPE_FINALITE_PRINCIPALE),
      responsableTraitement: this.toResponsableTraitement(responsableTraitement),
      sensibilite: this.toDefinition(sensibilite, TYPE_SENSIBILITE),
      etudeImpact: this.toDefinition(etudeImpact, TYPE_ETUDE_IMPACT),
      licieteTraitement: this.toDefinition(licieteTraitement, TYPE_LICEITE_TRAITEMENT),
      dureeConservation: this.toDuree(dureeConservation, DUREE_CONSERVATION),
      dureeArchivage: this.toDuree(dureeArchivage, DUREE_ARCHIVAGE),
    };
  }

  // Une valeur vide laisse la référence nulle : le back ne crée alors aucune
  // entrée de référentiel pour ce traitement.
  private toDefinition(valeur: string | null | undefined, type: string): Definition | null {
    return valeur?.trim() ? { type, valeur: valeur.trim() } : null;
  }

  private toDuree(valeur: string | null | undefined, estArchivage: boolean): Duree | null {
    return valeur?.trim() ? { estArchivage, valeur: valeur.trim() } : null;
  }

  private toResponsableTraitement(valeur: string | null | undefined): ResponsableTraitement | null {
    return valeur?.trim() ? { valeur: valeur.trim() } : null;
  }

  invalidStatusCause(field: string): string | undefined  {

    const control = this.form.get(field);
    if (!control?.invalid) return undefined;
    return control.hasError('required')
                  ? "Ce champ est requis."
                  : (control.hasError('maxlength')
                              ? "La limite de caractères de ce champ est dépassée (" + control.value.length + "/"
                                  + (field === "finalitePrincipale" ? this.validatorFinaliteMaxLength : this.validatorMaxLength) + ")"
                              : undefined);
  }
}
