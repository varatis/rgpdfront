import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { KeycloakService } from '../../../../../core/auth/keycloak.service';
import { CreateDemandePayload, Demande } from '../../../../../core/models/demande.model';
import {
  provideFrenchDatepicker,
  toIsoDate,
} from '../../../../../shared/config/datepicker-fr';
import { ApiService } from '../../../../../services/api.service';

interface DemandeFormValue {
  clientId: string | number | null;
  typeDemande: string;
  descriptionSynthetique: string;
  origine: string | null;
  dateReception: Date | null;
  servicesConcernes: string | null;
  detailTraitement: string | null;
  servicesImpliques: string | null;
  reponse: string | null;
  alerteRt: string | null;
  statut: Demande['statut'];
}

@Component({
  selector: 'app-create-demande-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDatepickerModule,
    MatSnackBarModule,
  ],
  providers: [provideFrenchDatepicker()],
  templateUrl: './create-demande-modal.html',
  styleUrl: './create-demande-modal.scss',
})
export class CreateDemandeModal {
  @Output() closed = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  private readonly apiService = inject(ApiService);
  private readonly keycloakService = inject(KeycloakService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly formBuilder = inject(FormBuilder);

  readonly form: FormGroup;

  /** Longueurs admises pour les deux seuls champs obligatoires du formulaire. */
  readonly typeDemandeMaxLength = 255;
  readonly descriptionMaxLength = 1000;

  readonly statutOptions: { value: Demande['statut']; label: string }[] = [
    { value: 'EN_ATTENTE', label: 'En attente' },
    { value: 'TRAITEE', label: 'Traitée' },
  ];

  isSubmitting = false;
  submitError: string | null = null;

  constructor() {
    this.form = this.formBuilder.group({
      clientId: [null],
      typeDemande: ['', [Validators.required, Validators.maxLength(this.typeDemandeMaxLength)]],
      descriptionSynthetique: [
        '',
        [Validators.required, Validators.maxLength(this.descriptionMaxLength)],
      ],
      origine: [''],
      dateReception: [null],
      servicesConcernes: [''],
      detailTraitement: [''],
      servicesImpliques: [''],
      reponse: [''],
      alerteRt: [''],
      statut: ['EN_ATTENTE' as Demande['statut'], Validators.required],
    });
  }

  /**
   * Récupère l'identifiant du client du groupe Keycloak « /clients/<nom> » pour
   * le porter sur la demande. Comportement inchangé par rapport à l'existant :
   * une résolution qui échoue se limite à un log console, sans message à
   * l'écran ni blocage du formulaire.
   */
  ngOnInit(): void {
    const clientName = this.keycloakService.getClientName();
    if (!clientName) {
      return;
    }

    this.apiService.getClientByNom(clientName).subscribe({
      next: client => this.form.patchValue({ clientId: client.id }),
      error: error => console.error(error),
    });
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
    // Erreur posée par le datepicker Material quand la saisie n'est pas une date.
    if (control.hasError('matDatepickerParse')) {
      return 'Date invalide — format attendu : JJ/MM/AAAA.';
    }
    return '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;

    this.apiService.createDemande(this.buildPayload()).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.snackBar.open('Demande créée avec succès', 'OK', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['snackbar-success'],
        });
        this.created.emit();
        this.closed.emit();
      },
      error: error => {
        console.error(error);
        this.isSubmitting = false;
        this.submitError = this.getErrorMessage(error);
        this.snackBar.open('Erreur lors de la création', 'Fermer', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['snackbar-error'],
        });
      },
    });
  }

  close(): void {
    if (!this.isSubmitting) {
      this.closed.emit();
    }
  }

  private buildPayload(): CreateDemandePayload {
    const value = this.form.getRawValue() as DemandeFormValue;

    return {
      clientId: value.clientId,
      typeDemande: this.text(value.typeDemande),
      descriptionSynthetique: this.text(value.descriptionSynthetique),
      origine: this.text(value.origine),
      // Le back attend un LocalDate : on sérialise depuis les composantes locales
      // pour éviter tout décalage de jour lié au fuseau horaire.
      dateReception: toIsoDate(value.dateReception),
      servicesConcernes: this.text(value.servicesConcernes),
      detailTraitement: this.text(value.detailTraitement),
      servicesImpliques: this.text(value.servicesImpliques),
      reponse: this.text(value.reponse),
      alerteRt: this.text(value.alerteRt),
      statut: value.statut,
    };
  }

  private text(value: string | null | undefined): string {
    return value?.trim() ?? '';
  }

  private getErrorMessage(error: { status?: number; error?: unknown }): string {
    if (typeof error?.error === 'string' && error.error.trim()) {
      return error.error;
    }
    return 'Une erreur est survenue. Veuillez réessayer.';
  }
}
