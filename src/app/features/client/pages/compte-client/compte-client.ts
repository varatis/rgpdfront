import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../../services/api.service';
import { InfoFichier } from '../../../../core/models/info-fichier.model';
import { UploadErrorSnackbar } from './upload-error-snackbar';

@Component({
  selector: 'app-compte-client',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './compte-client.html',
  styleUrl: './compte-client.scss'
})
export class CompteClient {
  selectedFile?: File;

  constructor(private apiService: ApiService, private snackBar: MatSnackBar) { }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];

    const allowedExtensions = ['xlsx', 'xls'];
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!extension || !allowedExtensions.includes(extension)) {
      this.snackBar.open(
        'Veuillez sélectionner un fichier Excel (.xlsx, .xls)',
        'Fermer',
        {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        }
      );
      input.value = '';
      this.selectedFile = undefined;
      return;
    }

    this.selectedFile = file;
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      return;
    }

    this.apiService.uploadRgpdFile(this.selectedFile).subscribe({

      next: (response) => {

        const isOk = response.statusFichier === 'OK';

        if (isOk) {
          this.snackBar.open(
            `Fichier importé avec succès : ${response.nomFichier}`,
            'Fermer',
            {
              duration: 5000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['snackbar-success']
            }
          );
        } else {
          // Statut KO : la snackbar reste ouverte jusqu'à fermeture manuelle
          // (pas de `duration`) et propose de copier le log complet de l'erreur.
          this.snackBar.openFromComponent(UploadErrorSnackbar, {
            data: {
              message: response.statusFichier || 'Échec de l’import du fichier',
              log: this.buildErrorLog(response)
            },
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
        }

        this.selectedFile = undefined;
      },

      error: (error) => {

        console.error(error);

        this.snackBar.open(
          'Erreur technique lors de l’import du fichier',
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

  private buildErrorLog(info: InfoFichier): string {
    return [
      `Fichier : ${info.nomFichier ?? ''}`,
      `Date de réception : ${info.dateReception ?? ''}`,
      `Date de fin de traitement : ${info.dateFinTraitement ?? ''}`,
      `Statut : ${info.statusFichier ?? ''}`
    ].join('\n');
  }

}
