import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../../services/api.service';

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

        this.snackBar.open(

          isOk
            ? `Fichier importé avec succès : ${response.nomFichier}`
            : response.statusFichier,

          'Fermer',

          {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',

            panelClass: isOk
              ? ['snackbar-success']
              : ['snackbar-error']
          }
        );

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

}
