import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { KeycloakService } from '../../../../core/auth/keycloak.service';
import { ImportApercu, InfoFichier } from '../../../../core/models/info-fichier.model';
import { ApiService } from '../../../../services/api.service';
import { ImportWarningModal, ImportWarningModalAction } from './import-warning-modal/import-warning-modal';
import { UploadErrorSnackbar } from './upload-error-snackbar';

@Component({
  selector: 'app-compte-client',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatSnackBarModule, MatDialogModule],
  templateUrl: './compte-client.html',
  styleUrl: './compte-client.scss'
})
export class CompteClient {
  private readonly apiService = inject(ApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly keycloakService = inject(KeycloakService);

  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;

  readonly clientName = this.keycloakService.getClientName();

  selectedFile?: File;
  importApercu: ImportApercu | null = null;
  isUploading = false;
  isLoadingPreview = false;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];
    const allowedExtensions = ['xlsx', 'xls'];
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!extension || !allowedExtensions.includes(extension)) {
      this.showErrorSnackbar('Veuillez sélectionner un fichier Excel (.xlsx, .xls)');
      this.resetSelectedFile(input);
      return;
    }

    this.selectedFile = file;
    this.importApercu = null;
    this.loadImportApercu(file);
  }

  uploadFile(): void {
    if (!this.selectedFile || this.isUploading || this.isLoadingPreview) {
      return;
    }

    if (this.importApercu?.fichierValide === false) {
      this.showUploadFailure({
        nomFichier: this.selectedFile.name,
        statusFichier: this.importApercu.messageErreur || 'Le fichier sélectionné ne peut pas être importé.'
      });
      return;
    }

    if (this.importApercu?.remplacementDonnees) {
      this.openImportWarningModal(this.importApercu);
      return;
    }

    this.executeUpload(false);
  }

  generateExport(onSuccess?: () => void): void {
    this.apiService.genererFichierRegistretraitement().subscribe({
      next: response => {
        if (!response.body) {
          this.showErrorSnackbar('Une erreur inattendue est survenue pendant la génération du fichier.');
          return;
        }

        const url = window.URL.createObjectURL(response.body);
        const a = document.createElement('a');
        a.href = url;

        let filename = 'Registre_traitement';
        const contentDisposition = response.headers.get('Content-Disposition');
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="?([^"]+)"?/);
          if (match) {
            filename = match[1];
          }
        }

        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);

        this.snackBar.open(
          'Le fichier de registre de traitement a été généré avec succès',
          'Fermer',
          {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
          }
        );

        onSuccess?.();
      },
      error: error => {
        console.error(error);
        this.showErrorSnackbar('Une erreur est survenue lors de la génération du fichier de registre de traitement');
      }
    });
  }

  private loadImportApercu(file: File): void {
    this.isLoadingPreview = true;
    const fileName = file.name;

    this.apiService.getImportApercu(fileName).subscribe({
      next: apercu => {
        if (this.selectedFile?.name !== fileName) {
          return;
        }

        this.importApercu = apercu;
        this.isLoadingPreview = false;

        if (apercu.fichierValide === false && apercu.messageErreur) {
          this.showErrorSnackbar(apercu.messageErreur);
        }
      },
      error: error => {
        if (this.selectedFile?.name !== fileName) {
          return;
        }

        console.error(error);
        this.importApercu = null;
        this.isLoadingPreview = false;
      }
    });
  }

  private executeUpload(confirmerRemplacement: boolean): void {
    if (!this.selectedFile) {
      return;
    }

    const file = this.selectedFile;
    this.isUploading = true;

    this.apiService.uploadRgpdFile(file, confirmerRemplacement).subscribe({
      next: response => {
        this.isUploading = false;

        if (response.confirmationRequise && response.apercu) {
          this.openImportWarningModal(response.apercu);
          return;
        }

        this.handleUploadResponse(response);
      },
      error: (error: HttpErrorResponse) => {
        this.isUploading = false;

        const payload = this.extractInfoFichier(error);
        if (error.status === 409 && payload?.confirmationRequise && payload.apercu) {
          this.openImportWarningModal(payload.apercu);
          return;
        }

        if (payload?.statusFichier) {
          this.showUploadFailure(payload);
          return;
        }

        console.error(error);
        this.showErrorSnackbar('Erreur technique lors de l’import du fichier');
      }
    });
  }

  private handleUploadResponse(response: InfoFichier): void {
    const isOk = response.statusFichier === 'OK';

    if (isOk) {
      this.snackBar.open(this.buildSuccessMessage(response), 'Fermer', {
        duration: 6000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['snackbar-success']
      });
    } else {
      this.showUploadFailure(response);
    }

    this.resetSelectedFile();
  }

  private openImportWarningModal(apercu: ImportApercu): void {
    const dialogRef = this.dialog.open(ImportWarningModal, {
      width: 'min(760px, calc(100vw - 24px))',
      maxWidth: '96vw',
      maxHeight: '92vh',
      autoFocus: false,
      panelClass: 'import-warning-dialog',
      data: { apercu }
    });

    dialogRef.afterClosed().subscribe((action: ImportWarningModalAction | undefined) => {
      if (action === 'confirm') {
        this.executeUpload(true);
        return;
      }

      if (action === 'export') {
        this.generateExport(() => this.openImportWarningModal(apercu));
      }
    });
  }

  private buildSuccessMessage(response: InfoFichier): string {
    const segments = [`Fichier importé avec succès : ${response.nomFichier}`];

    if (response.nombreTraitementsRemplaces != null || response.nombreTraitementsImportes != null) {
      segments.push(
        `${response.nombreTraitementsRemplaces ?? 0} traitement(s) remplacé(s)`,
        `${response.nombreTraitementsImportes ?? 0} traitement(s) importé(s)`
      );
    }

    if (response.version) {
      segments.push(`version ${response.version}`);
    }

    return segments.join(' • ');
  }

  private showUploadFailure(info: Partial<InfoFichier>): void {
    this.snackBar.openFromComponent(UploadErrorSnackbar, {
      data: {
        message: info.statusFichier || 'Échec de l’import du fichier',
        log: this.buildErrorLog(info)
      },
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['snackbar-error']
    });
  }

  private buildErrorLog(info: Partial<InfoFichier>): string {
    return [
      `Fichier : ${info.nomFichier ?? this.selectedFile?.name ?? ''}`,
      `Date de réception : ${info.dateReception ?? ''}`,
      `Date de fin de traitement : ${info.dateFinTraitement ?? ''}`,
      `Statut : ${info.statusFichier ?? ''}`,
      info.version ? `Version : ${info.version}` : null,
      info.nombreTraitementsRemplaces != null
        ? `Traitements remplacés : ${info.nombreTraitementsRemplaces}`
        : null,
      info.nombreTraitementsImportes != null
        ? `Traitements importés : ${info.nombreTraitementsImportes}`
        : null
    ].filter(Boolean).join('\n');
  }

  private extractInfoFichier(error: HttpErrorResponse): InfoFichier | null {
    const payload = error.error;
    if (!payload || typeof payload !== 'object') {
      return null;
    }
    return payload as InfoFichier;
  }

  private showErrorSnackbar(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['snackbar-error']
    });
  }

  private resetSelectedFile(input?: HTMLInputElement): void {
    this.selectedFile = undefined;
    this.importApercu = null;
    this.isLoadingPreview = false;

    if (input) {
      input.value = '';
      return;
    }

    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }
}
