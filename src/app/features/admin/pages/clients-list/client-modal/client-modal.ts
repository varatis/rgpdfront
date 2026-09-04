import { Component, Input, OnDestroy, OnInit, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { ApiService } from '../../../../../services/api.service';
import {
  Client,
  ClientWritePayload,
  STATUT_CLIENT_ACTIF,
  STATUT_CLIENT_ARCHIVE
} from '../../../../../core/models/client.model';

/**
 * Contrôles repris des contraintes du back. Le serveur détermine le format par
 * les octets de signature du fichier et non par ce type MIME : ces vérifications
 * ne sont qu'un confort, elles évitent un aller-retour, elles ne protègent rien.
 */
const TYPES_LOGO_AUTORISES = ['image/png', 'image/jpeg', 'image/webp'];
const TAILLE_MAX_LOGO = 1024 * 1024;

@Component({
  selector: 'app-client-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule, MatIconModule],
  templateUrl: './client-modal.html',
  styleUrl: './client-modal.scss'
})
export class ClientModal implements OnInit, OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly apiService = inject(ApiService);
  private readonly snackBar = inject(MatSnackBar);

  /** Client à modifier. Laissé à `null`, le formulaire s'ouvre en création. */
  @Input() client: Client | null = null;

  closed = output<void>();
  /** Client renvoyé par l'API, après création comme après modification. */
  saved = output<Client>();

  form!: FormGroup;
  isSubmitting = false;
  submitError: string | null = null;

  /** Fichier choisi mais pas encore déposé ; envoyé après l'enregistrement du client. */
  logoFile: File | null = null;
  /** Aperçu : URL d'objet du fichier choisi, ou du logo déjà en place. */
  logoUrl: string | null = null;
  logoErreur: string | null = null;
  /** Suppression demandée sur un logo existant, appliquée à l'enregistrement. */
  private logoASupprimer = false;

  readonly statuts = [
    { value: STATUT_CLIENT_ACTIF, label: 'Actuel' },
    { value: STATUT_CLIENT_ARCHIVE, label: 'Archivé' }
  ];

  get isEditMode(): boolean {
    return !!this.client;
  }

  get modalTitle(): string {
    return this.isEditMode ? 'Modifier le client' : 'Ajouter un client';
  }

  ngOnInit(): void {
    const client = this.client;

    this.form = this.formBuilder.group({
      nom: [client?.nom ?? '', [Validators.required, Validators.maxLength(255)]],
      statut: [client?.statut ?? STATUT_CLIENT_ACTIF, [Validators.maxLength(100)]],
      version: [client?.version ?? '', [Validators.maxLength(20)]],
      dateVersion: [client?.dateVersion ?? '']
    });

    if (client) {
      this.chargerLogoExistant(String(client.id));
    }
  }

  ngOnDestroy(): void {
    this.libererApercu();
  }

  close(): void {
    if (!this.isSubmitting) {
      this.closed.emit();
    }
  }

  /** Signale un champ obligatoire vide, une fois celui-ci visité. */
  isInvalid(controle: string): boolean {
    const champ = this.form.get(controle);
    return !!champ && champ.invalid && champ.touched;
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const fichier = input.files?.[0] ?? null;

    // L'input est vidé pour que choisir deux fois le même fichier déclenche l'événement.
    input.value = '';
    this.logoErreur = null;

    if (!fichier) {
      return;
    }

    if (!TYPES_LOGO_AUTORISES.includes(fichier.type)) {
      this.logoErreur = 'Formats acceptés : PNG, JPEG ou WebP.';
      return;
    }

    if (fichier.size > TAILLE_MAX_LOGO) {
      this.logoErreur = 'Le fichier ne doit pas dépasser 1 Mo.';
      return;
    }

    this.libererApercu();
    this.logoFile = fichier;
    this.logoASupprimer = false;
    this.logoUrl = URL.createObjectURL(fichier);
  }

  supprimerLogo(): void {
    this.libererApercu();
    this.logoFile = null;
    this.logoErreur = null;
    // En création il n'y a rien à supprimer côté serveur, seulement le fichier choisi.
    this.logoASupprimer = this.isEditMode;
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

    this.isSubmitting = true;
    this.submitError = null;

    const payload = this.buildPayload();
    const enregistrement: Observable<Client> = this.client
      ? this.apiService.updateClient(String(this.client.id), payload)
      : this.apiService.createClient(payload);

    enregistrement
      .pipe(
        // Le logo ne peut être déposé qu'une fois le client connu de la base :
        // en création, son identifiant n'existe qu'après la réponse du POST.
        switchMap(client =>
          this.enregistrerLogo(String(client.id)).pipe(
            map(() => ({ client, erreurLogo: null as string | null })),
            // Le client, lui, est bien enregistré : un échec du logo ne doit pas
            // faire passer l'opération entière pour un échec.
            catchError(err => of({ client, erreurLogo: this.messageErreurLogo(err) }))
          )
        )
      )
      .subscribe({
        next: ({ client, erreurLogo }) => {
          this.isSubmitting = false;

          if (erreurLogo) {
            this.notifier(
              `Client enregistré, mais le logo n'a pas pu être déposé : ${erreurLogo}`,
              'error'
            );
          } else {
            this.notifier(
              this.isEditMode ? 'Client modifié avec succès' : 'Client créé avec succès',
              'success'
            );
          }

          this.saved.emit(client);
          this.closed.emit();
        },
        error: err => {
          console.error(err);
          this.isSubmitting = false;
          this.submitError = this.messageErreurClient(err);
          this.notifier(
            this.isEditMode
              ? 'Erreur lors de la modification du client'
              : 'Erreur lors de la création du client',
            'error'
          );
        }
      });
  }

  private buildPayload(): ClientWritePayload {
    const valeurs = this.form.getRawValue();

    return {
      nom: (valeurs.nom ?? '').trim(),
      statut: this.texteOuNull(valeurs.statut),
      version: this.texteOuNull(valeurs.version),
      dateVersion: this.texteOuNull(valeurs.dateVersion)
    };
  }

  private enregistrerLogo(clientId: string): Observable<unknown> {
    if (this.logoASupprimer) {
      return this.apiService.deleteClientLogo(clientId).pipe(
        // 404 = il n'y avait rien à supprimer ; le résultat voulu est atteint.
        catchError(err => (err?.status === 404 ? of(null) : throwError(() => err)))
      );
    }

    if (this.logoFile) {
      return this.apiService.uploadClientLogo(clientId, this.logoFile);
    }

    return of(null);
  }

  private chargerLogoExistant(clientId: string): void {
    this.apiService.getClientLogo(clientId).subscribe({
      next: blob => {
        // Un fichier a pu être choisi entre-temps : il a la priorité sur l'existant.
        if (!this.logoFile && !this.logoASupprimer) {
          this.logoUrl = URL.createObjectURL(blob);
        }
      },
      // 404 = client sans logo : état nominal.
      error: () => {}
    });
  }

  /** Le back renvoie ses erreurs en ProblemDetail ; le message exploitable est dans `detail`. */
  private messageErreurLogo(err: unknown): string {
    const erreur = err as { status?: number; error?: { detail?: string } };

    if (erreur?.status === 413) {
      return 'le fichier dépasse la taille maximale autorisée.';
    }

    return erreur?.error?.detail ?? 'erreur inattendue.';
  }

  private messageErreurClient(err: unknown): string {
    const erreur = err as { status?: number; error?: string | { detail?: string } };

    // Le doublon de nom remonte en 409 avec un corps texte, pas un ProblemDetail.
    if (erreur?.status === 409) {
      return 'Un client portant ce nom existe déjà.';
    }

    if (typeof erreur?.error === 'object' && erreur.error?.detail) {
      return erreur.error.detail;
    }

    return 'Une erreur est survenue. Veuillez réessayer.';
  }

  private texteOuNull(valeur: string | null | undefined): string | null {
    const texte = (valeur ?? '').trim();
    return texte.length > 0 ? texte : null;
  }

  private libererApercu(): void {
    if (this.logoUrl) {
      URL.revokeObjectURL(this.logoUrl);
    }

    this.logoUrl = null;
  }

  private notifier(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, type === 'success' ? 'OK' : 'Fermer', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [type === 'success' ? 'snackbar-success' : 'snackbar-error']
    });
  }
}
