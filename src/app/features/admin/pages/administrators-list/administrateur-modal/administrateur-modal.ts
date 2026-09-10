import { Component, Input, OnInit, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { startWith, switchMap } from 'rxjs/operators';

import { ApiService } from '../../../../../services/api.service';
import { Client } from '../../../../../core/models/client.model';
import {
  Administrator,
  AdministratorCreatePayload,
  AdministratorRole,
  AdministratorUpdatePayload,
  administratorToUpdatePayload
} from '../../../../../shared/interfaces/administrator.interface';

@Component({
  selector: 'app-administrateur-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatCheckboxModule
  ],
  templateUrl: './administrateur-modal.html',
  styleUrl: './administrateur-modal.scss'
})
export class AdministrateurModal implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly apiService = inject(ApiService);
  private readonly snackBar = inject(MatSnackBar);

  @Input() admin: Administrator | null = null;

  closed = output<void>();
  saved = output<Administrator>();

  form!: FormGroup;
  isSubmitting = false;
  submitError: string | null = null;
  rolesErreur: string | null = null;

  clients: Client[] = [];
  clientsFiltres: Client[] = [];
  clientsErreur: string | null = null;

  get isEditMode(): boolean {
    return !!this.admin;
  }

  get modalTitle(): string {
    return this.isEditMode ? 'Modifier l\u2019administrateur' : 'Ajouter un administrateur';
  }

  get emailInvalide(): boolean {
    const champ = this.form.get('email');
    return !!champ && champ.touched && champ.hasError('email') && !champ.hasError('required');
  }

  get identifiantDiffere(): boolean {
    const identifiant = (this.admin?.identifiant ?? '').trim().toLowerCase();
    const email = (this.form.get('email')?.value ?? '').trim().toLowerCase();
    return !!identifiant && identifiant !== email;
  }

  ngOnInit(): void {
    const admin = this.admin;

    this.form = this.formBuilder.group({
      nom: [admin?.nom ?? '', [Validators.required, Validators.maxLength(100)]],
      prenom: [admin?.prenom ?? '', [Validators.required, Validators.maxLength(100)]],
      email: [admin?.email ?? '', [Validators.required, Validators.email, Validators.maxLength(255)]],
      clientNom: [
        admin?.clientNom ?? '',
        this.isEditMode ? [] : [Validators.required, this.clientConnu.bind(this)]
      ],
      roleUser: [this.admin?.roles.includes('user') ?? false],
      roleAdmin: [this.admin?.roles.includes('admin') ?? false]
    });

    this.form.get('clientNom')?.valueChanges.pipe(startWith('')).subscribe(valeur => {
      this.clientsFiltres = this.filtrerClients(valeur ?? '');
    });

    if (!this.isEditMode) {
      this.chargerClients();
    }
  }

  close(): void {
    if (!this.isSubmitting) {
      this.closed.emit();
    }
  }

  onModalEnter(event: Event): void {
    event.preventDefault();
    this.onSubmit();
  }

  isInvalid(controle: string): boolean {
    const champ = this.form.get(controle);
    return !!champ && champ.invalid && champ.touched;
  }

  onRoleChange(): void {
    this.rolesErreur = null;
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

    if (!this.isEditMode && !this.rolesSelectionnes().length) {
      this.rolesErreur = 'Veuillez choisir au moins un rôle.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;
    this.rolesErreur = null;

    if (this.admin) {
      this.apiService.updateAdministrator(this.admin.id, this.buildUpdatePayload(this.admin)).subscribe({
        next: admin => {
          this.isSubmitting = false;
          this.notifier('Administrateur modifié avec succès', 'success');
          this.saved.emit(admin);
          this.closed.emit();
        },
        error: err => {
          this.isSubmitting = false;
          this.submitError = this.messageErreur(err);
          this.notifier('Erreur lors de la modification de l\u2019administrateur', 'error');
        }
      });
    } else {
      const payload = this.buildCreatePayload();

      this.apiService
        .createAdministrator(payload)
        .pipe(switchMap(created => this.apiService.updateAdministrator(created.id, payload)))
        .subscribe({
          next: admin => {
            this.isSubmitting = false;
            this.notifier('Administrateur créé avec succès', 'success');
            this.saved.emit(admin);
            this.closed.emit();
          },
          error: err => {
            this.isSubmitting = false;
            this.submitError = this.messageErreur(err);
            this.notifier('Erreur lors de la création de l\u2019administrateur', 'error');
          }
        });
    }
  }

  private buildCreatePayload(): AdministratorCreatePayload {
    const valeurs = this.form.getRawValue();
    const nomClient = (valeurs.clientNom ?? '').trim();
    const client = this.clients.find(item => this.normaliser(item.nom) === this.normaliser(nomClient));

    return {
      nom: (valeurs.nom ?? '').trim(),
      prenom: (valeurs.prenom ?? '').trim(),
      email: (valeurs.email ?? '').trim(),
      roles: this.rolesSelectionnes(),
      clientId: String(client?.id ?? ''),
      groupe: nomClient,
      actif: true
    };
  }

  private buildUpdatePayload(admin: Administrator): AdministratorUpdatePayload {
    const valeurs = this.form.getRawValue();

    return administratorToUpdatePayload(admin, {
      nom: (valeurs.nom ?? '').trim(),
      prenom: (valeurs.prenom ?? '').trim(),
      email: (valeurs.email ?? '').trim()
    });
  }

  private rolesSelectionnes(): AdministratorRole[] {
    const valeurs = this.form.getRawValue();
    const roles: AdministratorRole[] = [];

    if (valeurs.roleUser) {
      roles.push('user');
    }

    if (valeurs.roleAdmin) {
      roles.push('admin');
    }

    return roles;
  }

  private clientConnu(controle: AbstractControl): ValidationErrors | null {
    const saisie = this.normaliser(controle.value);

    if (!saisie) {
      return null;
    }

    const trouve = this.clients.some(client => this.normaliser(client.nom) === saisie);

    return trouve ? null : { clientInconnu: true };
  }

  private chargerClients(): void {
    this.clientsErreur = null;

    this.apiService.getClients().subscribe({
      next: clients => {
        this.clients = [...clients].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
        this.clientsFiltres = this.filtrerClients(this.form.get('clientNom')?.value ?? '');
        this.form.get('clientNom')?.updateValueAndValidity();
      },
      error: () => {
        this.clients = [];
        this.clientsFiltres = [];
        this.clientsErreur = 'La liste des clients n\u2019a pas pu être chargée.';
      }
    });
  }

  private filtrerClients(saisie: string): Client[] {
    const recherche = this.normaliser(saisie);

    if (!recherche) {
      return this.clients;
    }

    return this.clients.filter(client => this.normaliser(client.nom).includes(recherche));
  }

  private normaliser(valeur?: string): string {
    return (valeur ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private messageErreur(err: unknown): string {
    const erreur = err as {
      status?: number;
      error?: string | { detail?: string; message?: string };
    };

    if (erreur?.status === 409) {
      return 'Un administrateur avec cette adresse mail existe déjà.';
    }

    const corps = erreur?.error;

    if (typeof corps === 'string' && corps.trim()) {
      return corps.trim();
    }

    if (typeof corps === 'object' && corps) {
      if (corps.detail) {
        return corps.detail;
      }

      if (corps.message) {
        return corps.message;
      }
    }

    return 'Une erreur est survenue. Veuillez réessayer.';
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
