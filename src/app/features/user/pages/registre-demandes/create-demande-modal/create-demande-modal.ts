import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../../../services/api.service';
import { KeycloakService } from '../../../../../core/auth/keycloak.service';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-create-demande-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './create-demande-modal.html',
  styleUrls: ['./create-demande-modal.scss']
})
export class CreateDemandeModal implements OnInit {

  @Output() closed = new EventEmitter<void>();

  @Output() created = new EventEmitter<void>();

  form: FormGroup;

  isSubmitting = false;

  submitError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private keycloakService: KeycloakService,
    private snackBar: MatSnackBar
  ) {

    this.form = this.fb.group({

      clientId: [null],

      typeDemande: ['', [Validators.required, Validators.maxLength(255)]],

      descriptionSynthetique: ['', Validators.required],

      origine: [''],

      dateReception: [''],

      servicesConcernes: [''],

      detailTraitement: [''],

      servicesImpliques: [''],

      reponse: [''],

      alerteRt: [''],

      statut: ['EN_ATTENTE']

    });
  }

  ngOnInit(): void {

    const clientName = this.keycloakService.getClientName();

    if (!clientName) {
      return;
    }

    this.apiService.getClientByNom(clientName)
      .subscribe({

        next: client => {

          this.form.patchValue({
            clientId: client.id
          });

        },

        error: err => {
          console.error(err);
        }

      });

  }

  close(): void {
    if (!this.isSubmitting) {
      this.closed.emit();
    }
  }

  onSubmit(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;

    const payload = {
      ...this.form.value,
      typeDemande: (this.form.value.typeDemande as string).trim(),
      descriptionSynthetique: (this.form.value.descriptionSynthetique as string).trim()
    };

    this.apiService.createDemande(payload).subscribe({

      next: (response) => {

        console.log('Demande créée', response);

        this.isSubmitting = false;

        this.snackBar.open(
          'Demande créée avec succès',
          'OK',
          {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
          }
        );

        this.created.emit();

        this.closed.emit();

      },

      error: (err) => {

        console.error(err);

        this.isSubmitting = false;

        this.submitError = 'Une erreur est survenue. Veuillez réessayer.';

        this.snackBar.open(
          'Erreur lors de la création de la demande',
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

  /**
   * Message de validation d’un champ obligatoire, affiché une fois le champ
   * touché ou après une tentative de soumission (markAllAsTouched).
   * Même logique que les modals de préconisation et de traitement.
   */
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
}
