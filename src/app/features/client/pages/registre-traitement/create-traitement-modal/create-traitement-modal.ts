import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../../../services/api.service';
import { TraitementDetails } from '../../../../../core/models/traitement.model';

@Component({
  selector: 'app-create-traitement-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-traitement-modal.html',
  styleUrls: ['./create-traitement-modal.scss'],
})
export class CreateTraitementModal implements OnInit {
  @Input() traitementToEdit: TraitementDetails | undefined;
  @Output() closed  = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  isSubmitting = false;
  submitError: string | null = null;
  activeTab = 0;
  form: FormGroup;

  get isEditMode(): boolean {
    return !!this.traitementToEdit;
  }

  readonly tabs = [
    'Identification du traitement',
    'Données personnelles traitées',
    'Description du traitement',
  ];

  constructor(private apiService: ApiService, private fb: FormBuilder) {
    this.form = this.fb.group({
      id:                       [0],
      // Tab 1 — Identification
      nom:                      ['', [Validators.required, Validators.maxLength(255)]],
      dateIdentification:       ['', Validators.required],
      gestionnaire:             ['', Validators.maxLength(255)],
      finalitePrincipale:       ['', Validators.maxLength(500)],
      dateMiseAJour:            [''],
      historiqueModifications:  [''],
      dataProtectionOfficer:    [''],
      responsableTraitement:    [''],
      gestionnaireMiseEnOeuvre: [''],
      sousFinalites:            [''],
      // Tab 2 — Données personnelles
      categoriesPersonnesConcernees:  [''],
      donneesIdentification:          [''],
      donneesConnexion:               [''],
      donneesLocalisation:            [''],
      donneesComportementViePerso:    [''],
      donneesEconomiquesFinancieres:  [''],
      donneesProfessionnelles:        [''],
      categoriesParticulieresDonnees: [''],
      sensibilite:                    [''],
      etudeImpact:                    [''],
      // Tab 3 — Description
      canauxCollecteDonnees:          [''],
      licieteTraitement:              [''],
      recoursTraitementAutomatises:   [false],
      emplacementPhysique:            [''],
      dispositionsSecuriteDonnees:    [''],
      emplacementNumerique:           [''],
      hebergement:                    [''],
      dureeConservation:              [null],
      archivage:                      [false],
      dureeArchivage:                 [null],
      categoriesDestinataires:        [''],
      raisonsTransfertDestinataires:  [''],
      transfertsHorsUE:               [false],
      paysDestinataires:              [''],
      commentaires:                   [''],
    });
  }

  ngOnInit(): void {
    if (this.traitementToEdit) {
      this.form.patchValue({
        ...this.traitementToEdit,
        dateIdentification: this.toDateString(this.traitementToEdit.dateIdentification),
        dateMiseAJour:      this.toDateString(this.traitementToEdit.dateMiseAJour),
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
      ? this.apiService.updateTraitement(this.traitementToEdit!.id, this.form.value)
      : this.apiService.createTraitement(this.form.value);

    call$.subscribe({
      next: () => {
        this.isSubmitting = false;
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
      },
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}
