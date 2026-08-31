import { Component, Input, OnInit, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../../services/api.service';
import { KeycloakService } from '../../../../../core/auth/keycloak.service';
import {
  CreateViolationPayload,
  ViolationClient,
  ViolationDetails,
  ViolationStatut
} from '../../../../../core/models/violation.model';

@Component({
  selector: 'app-violation-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './violation-modal.html',
  styleUrl: './violation-modal.scss'
})
export class ViolationModal implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly apiService = inject(ApiService);
  private readonly keycloakService = inject(KeycloakService);
  private readonly snackBar = inject(MatSnackBar);

  /**
   * Détail complet à modifier — le PUT renvoie le DTO entier, `client` compris.
   * Laissé à `null`, le formulaire s'ouvre en création.
   */
  @Input() violation: ViolationDetails | null = null;

  closed = output<void>();
  /** Violation renvoyée par l'API, après création comme après modification. */
  saved = output<ViolationDetails>();

  form!: FormGroup;
  isSubmitting = false;
  submitError: string | null = null;

  /**
   * Client porteur de la violation : repris du détail en modification, résolu depuis
   * le groupe Keycloak en création. Le back le refuse à `null`.
   */
  private client?: ViolationClient;

  readonly statuts: { value: ViolationStatut; label: string }[] = [
    { value: 'EN_COURS', label: 'En cours de traitement' },
    { value: 'TRAITEE', label: 'Traité' }
  ];

  get isEditMode(): boolean {
    return !!this.violation;
  }

  get modalTitle(): string {
    return this.isEditMode ? 'Modifier la violation' : 'Déclarer une violation';
  }

  ngOnInit(): void {
    const violation = this.violation;
    // La création impose les deux colonnes identifiantes de la liste ; la modification
    // n'ajoute pas de contrainte aux violations déjà enregistrées sans elles.
    const obligatoireALaCreation = this.isEditMode ? [] : [Validators.required];

    this.form = this.formBuilder.group({
      dateViolation: [violation?.dateViolation ?? '', obligatoireALaCreation],
      natureViolation: [violation?.natureViolation ?? '', obligatoireALaCreation],
      donneesConcernees: [violation?.donneesConcernees ?? ''],
      nombreApproximatifDonneesConcernees: [violation?.nombreApproximatifDonneesConcernees ?? null],
      categoriesPersonnesConcernees: [violation?.categoriesPersonnesConcernees ?? ''],
      nombrePersonnesConcernees: [violation?.nombrePersonnesConcernees ?? null],
      consequences: [violation?.consequences ?? ''],
      mesuresPrisesPrevues: [violation?.mesuresPrisesPrevues ?? ''],
      informationCnil: [violation?.informationCnil ?? ''],
      // Tri-état rendu par un select : '' = non renseigné, distinct de « Non ».
      risqueEleveDroitsLibertes: [this.booleanToChoice(violation?.risqueEleveDroitsLibertes)],
      communicationPersonnesEffectueeEtDate: [violation?.communicationPersonnesEffectueeEtDate ?? ''],
      commentaires: [violation?.commentaires ?? ''],
      statut: [violation?.statut ?? 'EN_COURS']
    });

    if (violation) {
      this.client = violation.client;
    } else {
      this.loadClient();
    }
  }

  close(): void {
    if (!this.isSubmitting) {
      this.closed.emit();
    }
  }

  /** Signale un champ obligatoire vide, une fois celui-ci visité ou le formulaire soumis. */
  isInvalid(controle: string): boolean {
    const champ = this.form.get(controle);
    return !!champ && champ.invalid && champ.touched;
  }

  onSubmit(): void {
    if (this.isSubmitting) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.submitError = 'Veuillez renseigner les champs obligatoires.';
      return;
    }

    if (!this.client) {
      this.submitError = "Le client associé à votre compte n'a pas pu être déterminé.";
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;

    const payload = this.buildPayload(this.client);
    const requete: Observable<ViolationDetails> = this.violation
      ? this.apiService.updateViolation(this.violation.identifiant, {
          ...payload,
          identifiant: this.violation.identifiant
        })
      : this.apiService.createViolation(payload);

    requete.subscribe({
      next: (violation) => {
        this.isSubmitting = false;
        this.snackBar.open(
          this.isEditMode ? 'Violation modifiée avec succès' : 'Violation créée avec succès',
          'OK',
          {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
          }
        );
        this.saved.emit(violation);
        this.closed.emit();
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
        this.submitError = 'Une erreur est survenue. Veuillez réessayer.';
        this.snackBar.open(
          this.isEditMode
            ? 'Erreur lors de la modification de la violation'
            : 'Erreur lors de la création de la violation',
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

  /** En création, le client vient du groupe Keycloak de l'utilisateur (`/clients/<nom>`). */
  private loadClient(): void {
    const clientNom = this.keycloakService.getClientName();

    if (!clientNom) {
      this.submitError = "Aucun client n'est associé à votre compte.";
      return;
    }

    this.apiService.getClientByNom(clientNom).subscribe({
      next: (client) => {
        this.client = { id: String(client.id), nom: client.nom, statut: client.statut };
      },
      error: (err) => {
        console.error(err);
        this.submitError = 'Impossible de récupérer le client associé à votre compte.';
      }
    });
  }

  private buildPayload(client: ViolationClient): CreateViolationPayload {
    const valeurs = this.form.getRawValue();

    return {
      // Le back résout le client par son id et refuse la requête sans lui.
      client,
      dateViolation: this.textOrUndefined(valeurs.dateViolation),
      natureViolation: this.textOrUndefined(valeurs.natureViolation),
      donneesConcernees: this.textOrUndefined(valeurs.donneesConcernees),
      nombreApproximatifDonneesConcernees: this.numberOrUndefined(valeurs.nombreApproximatifDonneesConcernees),
      categoriesPersonnesConcernees: this.textOrUndefined(valeurs.categoriesPersonnesConcernees),
      nombrePersonnesConcernees: this.numberOrUndefined(valeurs.nombrePersonnesConcernees),
      consequences: this.textOrUndefined(valeurs.consequences),
      mesuresPrisesPrevues: this.textOrUndefined(valeurs.mesuresPrisesPrevues),
      informationCnil: this.textOrUndefined(valeurs.informationCnil),
      risqueEleveDroitsLibertes: this.choiceToBoolean(valeurs.risqueEleveDroitsLibertes),
      communicationPersonnesEffectueeEtDate: this.textOrUndefined(valeurs.communicationPersonnesEffectueeEtDate),
      commentaires: this.textOrUndefined(valeurs.commentaires),
      statut: valeurs.statut as ViolationStatut
    };
  }

  /** Un champ vidé doit repartir à `null`, pas en chaîne vide. */
  private textOrUndefined(value: string | null): string | undefined {
    const texte = (value ?? '').trim();
    return texte === '' ? undefined : texte;
  }

  private numberOrUndefined(value: number | string | null): number | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    const nombre = Number(value);
    return Number.isFinite(nombre) ? nombre : undefined;
  }

  private booleanToChoice(value?: boolean): string {
    if (value === null || value === undefined) {
      return '';
    }
    return value ? 'true' : 'false';
  }

  private choiceToBoolean(value: string): boolean | undefined {
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
    return undefined;
  }
}
