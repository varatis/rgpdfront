import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ImportApercu } from '../../../../../core/models/info-fichier.model';

export interface ImportWarningModalData {
  apercu: ImportApercu;
}

export type ImportWarningModalAction = 'cancel' | 'export' | 'confirm';

@Component({
  selector: 'app-import-warning-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './import-warning-modal.html',
  styleUrl: './import-warning-modal.scss'
})
export class ImportWarningModal {
  constructor(
    public dialogRef: MatDialogRef<ImportWarningModal, ImportWarningModalAction>,
    @Inject(MAT_DIALOG_DATA) public data: ImportWarningModalData
  ) {}

  close(action: ImportWarningModalAction): void {
    this.dialogRef.close(action);
  }

  value(value: string | number | null | undefined): string {
    if (value == null || value === '') {
      return '—';
    }
    return String(value);
  }
}
