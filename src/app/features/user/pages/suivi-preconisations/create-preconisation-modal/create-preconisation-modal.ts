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
  private initialEditSnapshot: string | null = null;

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

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.client) {
      this.submitError = 'Le client associé à la préconisation est introuvable.';
      return;
    }

    const value = this.form.getRawValue() as PreconisationFormValue;
    const notificationModification = this.optionalText(value.notificationModification);

    if (this.isEditMode && this.hasEditableChanges() && !notificationModification) {
      this.notificationModificationRequired = true;
      return;
    }

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
      ? 'Ce champ est requis si vous modifiez le formulaire.'
      : '';
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

    return appendPreconisationHistorique(commentaireAvecHistorique, notification);
  }

  private captureInitialEditSnapshot(): void {
    this.initialEditSnapshot = this.computeEditableSnapshot();
  }

  private hasEditableChanges(): boolean {
    return this.initialEditSnapshot !== null && this.initialEditSnapshot !== this.computeEditableSnapshot();
  }

  private computeEditableSnapshot(): string {
    const raw = this.form.getRawValue() as PreconisationFormValue;
    const normalized = Object.fromEntries(
      CreatePreconisationModal.CHAMPS_EDITABLES.map(champ => [champ, this.normalizeSnapshotValue(raw[champ])])
    );

    return JSON.stringify(normalized);
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
