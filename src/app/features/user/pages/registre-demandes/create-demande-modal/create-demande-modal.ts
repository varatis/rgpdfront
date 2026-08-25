import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {ApiService} from '../../../../../services/api.service';
import {KeycloakService} from '../../../../../core/auth/keycloak.service';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-create-demande-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-demande-modal.html',
  styleUrls: ['./create-demande-modal.scss']
})
export class CreateDemandeModal implements OnInit{

  @Output() closed = new EventEmitter<void>();

  @Output() created = new EventEmitter<void>();

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private keycloakService: KeycloakService
  ) {

    this.form = this.fb.group({

      clientId: [null],

      typeDemande: [''],

      descriptionSynthetique: [''],

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
    this.closed.emit();
  }

  onSubmit(): void {

    this.apiService.createDemande(
      this.form.value
    ).subscribe({

      next: (response) => {

        console.log('Demande créée', response);

        this.created.emit();

        this.closed.emit();

      },

      error: (err) => {

        console.error(err);

      }

    });

  }
}
