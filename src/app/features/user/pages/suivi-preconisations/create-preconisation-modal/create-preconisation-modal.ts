import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { catchError, of } from 'rxjs';
import { KeycloakService } from '../../../../../core/auth/keycloak.service';
import { Client } from '../../../../../core/models/client.model';
import {
  appendPreconisationHistorique,
  buildPreconisationCommentaire,
  PreconisationDetails,
  PreconisationWritePayload,
  scaleLabel,
  splitPreconisationCommentaire,
} from '../../../../../core/models/preconisation.model';
import { Traitement } from '../../../../../core/models/traitement.model';
import { ApiService } from '../../../../../services/api.service';

interface PreconisationFormValue {
  libelle: string;
  explication: string | null;
  risqueEncours: string | null;
  contraintes: string | null;
  cout: string | null;
  priorite: string | null;
  complexite: string | null;
  commentaire: string | null;
  notificationModification: string | null;
  etatAvancement: string | null;
  traitementIdentifiant: string | null;
}

@Component({
  selector: 'app-create-preconisation-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './create-preconisation-modal.html',
  styleUrl: './create-preconisation-modal.scss'
})
export class CreatePreconisationModal implements OnInit {
  private static readonly CHAMPS_EDITABLES = [
    'libelle',
    'explication',
    'risqueEncours',
    'contraintes',
    'cout',
    'priorite',
    'complexite',
    'commentaire',
    'etatAvancement',
    'traitementIdentifiant',
  ] as const;

  private static readonly CHAMP_LABELS: Record<string, string> = {
    libelle: 'Préconisation',
    explication: 'Description / explication',
    risqueEncours: 'Risque encouru',
    contraintes: 'Contraintes',
    cout: 'Coût',
    priorite: 'Priorité',
    complexite: 'Complexité',
    commentaire: 'Commentaire',
    etatAvancement: 'État d’avancement',
    traitementIdentifiant: 'Traitement lié',
  };

  @Input() preconisationToEdit: PreconisationDetails | undefined;
  @Output() closed = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  private readonly apiService = inject(ApiService);
  private readonly keycloakService = inject(KeycloakService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly formBuilder = inject(FormBuilder);

  readonly form: FormGroup;
  readonly prioriteChoices = ['Très urgent', 'Urgent', 'Peu urgent', 'Normal'];
  readonly complexiteChoices = ['Très simple', 'Moyennement complexe', 'Complexe'];

  client: Client | null = null;
  traitements: Traitement[] = [];
  loading = true;
  isSubmitting = false;
  submitError: string | null = null;
  loadError: string | null = null;
  notificationModificationRequired = false;
  notificationModificationMandatory = false;
  private initialEditSnapshot: string | null = null;
  private initialEditState: Record<string, unknown> | null = null;

  constructor() {
    this.form = this.formBuilder.group({
      libelle: ['', [Validators.required, Validators.maxLength(255)]],
      explication: [''],
      risqueEncours: [''],
      contraintes: [''],
      cout: [''],
      priorite: [null],
      complexite: [null],
      commentaire: [''],
      notificationModification: [''],
      etatAvancement: [''],
      traitementIdentifiant: [null]
    });
  }

  get isEditMode(): boolean {
    return !!this.preconisationToEdit;
  }

  get availablePriorites(): string[] {
    return this.withCurrentChoice(this.prioriteChoices, this.form.get('priorite')?.value);
  }

  get availableComplexites(): string[] {
    return this.withCurrentChoice(this.complexiteChoices, this.form.get('complexite')?.value);
  }

  ngOnInit(): void {
    if (this.preconisationToEdit) {
      const commentaire = splitPreconisationCommentaire(this.preconisationToEdit.commentaire);

      this.form.patchValue({
        libelle: this.preconisationToEdit.libelle,
        explication: this.preconisationToEdit.explication ?? '',
        risqueEncours: this.preconisationToEdit.risqueEncours ?? '',
        contraintes: this.preconisationToEdit.contraintes ?? '',
        cout: this.preconisationToEdit.cout ?? '',
        priorite: this.preconisationToEdit.priorite ?? null,
        complexite: this.preconisationToEdit.complexite ?? null,
        commentaire: commentaire.commentaire ?? '',
        notificationModification: '',
        etatAvancement: this.preconisationToEdit.etatAvancement ?? '',
        traitementIdentifiant: this.preconisationToEdit.traitementIdentifiant ?? null
      });
      this.captureInitialEditSnapshot();
    }

    this.updateNotificationModificationValidation();
    this.form.valueChanges.subscribe(() => {
      this.updateNotificationModificationValidation();
    });

    const clientFromDetails = this.preconisationToEdit?.client;
    if (clientFromDetails) {
      this.setClientAndLoadTreatments(clientFromDetails);
      return;
    }

    const clientName = this.keycloakService.getClientName();
    if (!clientName) {
      this.loading = false;
      this.loadError = 'Le client de l’utilisateur connecté est introuvable.';
      return;
    }

    this.apiService.getClientByNom(clientName).subscribe({
      next: client => this.setClientAndLoadTreatments(client),
      error: error => {
        console.error(error);
        this.loading = false;
        this.loadError = 'Impossible de récupérer le client associé.';
      }
    });
  }

  onSubmit(): void {
    this.notificationModificationRequired = false;
    this.updateNotificationModificationValidation();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificationModificationRequired = this.form.get('notificationModification')?.hasError('required') ?? false;
      return;
    }
    if (!this.client) {
      this.submitError = 'Le client associé à la préconisation est introuvable.';
      return;
    }

    const value = this.form.getRawValue() as PreconisationFormValue;
    const notificationModification = this.optionalText(value.notificationModification);

    this.isSubmitting = true;
    this.submitError = null;

    const payload: PreconisationWritePayload = {
      identifiant: this.preconisationToEdit?.identifiant ?? crypto.randomUUID(),
      libelle: value.libelle.trim(),
      explication: this.optionalText(value.explication),
      risqueEncours: this.optionalText(value.risqueEncours),
      contraintes: this.optionalText(value.contraintes),
      cout: this.optionalText(value.cout),
      priorite: this.optionalText(value.priorite),
      complexite: this.optionalText(value.complexite),
      commentaire: this.buildCommentairePayload(value),
      etatAvancement: this.optionalText(value.etatAvancement),
      client: this.client,
      traitementIdentifiant: value.traitementIdentifiant || null
    };

    const request$ = this.isEditMode
      ? this.apiService.updatePreconisation(this.preconisationToEdit!.identifiant, payload)
      : this.apiService.createPreconisation(payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.snackBar.open(
          this.isEditMode ? 'Préconisation modifiée avec succès' : 'Préconisation créée avec succès',
          'OK',
          {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
          }
        );
        (this.isEditMode ? this.updated : this.created).emit();
        this.closed.emit();
      },
      error: error => {
        console.error(error);
        this.isSubmitting = false;
        this.submitError = this.getErrorMessage(error);
        this.snackBar.open(
          this.isEditMode ? 'Erreur lors de la modification' : 'Erreur lors de la création',
          'Fermer',
          {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          }
        );
      }
    });
  }

  close(): void {
    if (!this.isSubmitting) {
      this.closed.emit();
    }
  }

  scaleValue(value?: string | null): string {
    return scaleLabel(value);
  }

  invalidStatusCause(field: string): string {
    const control = this.form.get(field);
    if (!control?.invalid || (!control.dirty && !control.touched)) {
      return '';
    }
    if (control.hasError('required')) {
      return 'Ce champ est requis.';
    }
    if (control.hasError('maxlength')) {
      return 'La limite de caractères est dépassée.';
    }
    return '';
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
    control.setValidators(this.notificationModificationMandatory ? [Validators.required] : []);
    control.updateValueAndValidity({ emitEvent: false });

    if (!this.notificationModificationMandatory || (control.value?.trim?.() ?? '')) {
      this.notificationModificationRequired = false;
    }
  }

  private setClientAndLoadTreatments(client: Client): void {
    this.client = client;
    this.loading = true;

    this.apiService.getTraitements(0, 1000, 'nom', 'asc', client.nom).pipe(
      catchError(error => {
        console.error(error);
        this.loadError = 'Les traitements liés n’ont pas pu être chargés.';
        return of({ content: [], totalElements: 0, totalPages: 0, size: 1000, number: 0 });
      })
    ).subscribe(result => {
      this.traitements = [...(result.content ?? [])].sort(
        (a, b) => a.idFonctionnel - b.idFonctionnel
      );
      this.loading = false;
    });
  }

  private withCurrentChoice(choices: string[], current: unknown): string[] {
    if (typeof current !== 'string' || !current || choices.includes(current)) {
      return choices;
    }
    return [current, ...choices];
  }

  private optionalText(value: string | null | undefined): string | null {
    const text = value?.trim() ?? '';
    return text || null;
  }

  private buildCommentairePayload(value: PreconisationFormValue): string | null {
    const commentaire = this.optionalText(value.commentaire);
    const notification = this.optionalText(value.notificationModification);

    if (!this.isEditMode) {
      return commentaire;
    }

    const parsedExisting = splitPreconisationCommentaire(this.preconisationToEdit?.commentaire);
    const commentaireAvecHistorique = buildPreconisationCommentaire(commentaire, parsedExisting.historique);
    const summary = this.buildHistorySummary();

    return appendPreconisationHistorique(
      commentaireAvecHistorique,
      notification,
      summary.fields,
      summary.changes
    );
  }

  private captureInitialEditSnapshot(): void {
    this.initialEditState = this.buildEditableState();
    this.initialEditSnapshot = JSON.stringify(this.initialEditState);
  }

  private hasEditableChanges(): boolean {
    return this.initialEditSnapshot !== null && this.initialEditSnapshot !== JSON.stringify(this.buildEditableState());
  }

  private buildEditableState(): Record<string, unknown> {
    const raw = this.form.getRawValue() as PreconisationFormValue;

    return Object.fromEntries(
      CreatePreconisationModal.CHAMPS_EDITABLES.map(champ => [champ, this.normalizeSnapshotValue(raw[champ])])
    );
  }

  private buildHistorySummary(): { fields: string[]; changes: string[] } {
    const currentState = this.buildEditableState();
    const initialState = this.initialEditState ?? {};
    const fields: string[] = [];
    const changes: string[] = [];

    CreatePreconisationModal.CHAMPS_EDITABLES.forEach(champ => {
      const before = initialState[champ];
      const after = currentState[champ];

      if (JSON.stringify(before) === JSON.stringify(after)) {
        return;
      }

      fields.push(CreatePreconisationModal.CHAMP_LABELS[champ] ?? champ);
      changes.push(`${this.prettyValue(champ, before)} → ${this.prettyValue(champ, after)}`);
    });

    return { fields, changes };
  }

  private prettyValue(field: string, value: unknown): string {
    if (value == null || value === '') {
      return 'vide';
    }

    if (field === 'priorite' || field === 'complexite') {
      return scaleLabel(String(value));
    }

    if (field === 'traitementIdentifiant') {
      return this.resolveTraitementLabel(String(value));
    }

    return String(value);
  }

  private resolveTraitementLabel(identifiant: string): string {
    const traitement = this.traitements.find(item => item.identifiant === identifiant)
      ?? (this.preconisationToEdit?.traitementIdentifiant === identifiant
        ? {
            identifiant,
            idFonctionnel: this.preconisationToEdit.traitementIdFonctionnel,
            nom: this.preconisationToEdit.traitementNom,
          }
        : undefined);

    if (!traitement) {
      return identifiant || 'vide';
    }

    return traitement.idFonctionnel != null && traitement.nom
      ? `${traitement.idFonctionnel} - ${traitement.nom}`
      : (traitement.nom ?? identifiant);
  }

  private normalizeSnapshotValue(value: unknown): unknown {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed === '' ? null : trimmed;
    }

    return value ?? null;
  }

  private getErrorMessage(error: { status?: number; error?: unknown }): string {
    if (error?.status === 409) {
      return typeof error.error === 'string'
        ? error.error
        : 'Une préconisation avec ce libellé existe déjà.';
    }
    if (typeof error?.error === 'string' && error.error.trim()) {
      return error.error;
    }
    return 'Une erreur est survenue. Veuillez réessayer.';
  }
}
