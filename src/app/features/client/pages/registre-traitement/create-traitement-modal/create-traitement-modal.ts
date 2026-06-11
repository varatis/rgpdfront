import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../../../services/api.service';
import { TraitementDetails } from '../../../../../core/models/traitement.model';

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

  get isEditMode(): boolean {
    return !!this.traitementToEdit;
  }

  readonly tabs = [
    'Identification du traitement',
    'Données personnelles traitées',
    'Description du traitement',
  ];

  constructor(private apiService: ApiService, private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      idFonctionnel: [null],
      // Client mocké pour le moment
      client: this.fb.group({
        id: ["5a9751d2-954b-460f-b19d-883ea7142a6b"],
        nom: ["U Tech"],
        statut: ["actif"],
      }),
      version: [null],
      // Tab 1 — Identification
      nom: ['', [Validators.required, Validators.maxLength(255)]],
      dateIdentification: [null, Validators.required],
      gestionnaire: [null, Validators.maxLength(255)],
      finalitePrincipale: [null, Validators.maxLength(500)],
      dateMiseAJour: [null],
      historiqueModifications: [null],
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

    const call$ = this.isEditMode
      ? this.apiService.updateTraitement(
        this.traitementToEdit!.idFonctionnel,
        this.form.value
      )
      : this.apiService.createTraitement(this.form.value);

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

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}
