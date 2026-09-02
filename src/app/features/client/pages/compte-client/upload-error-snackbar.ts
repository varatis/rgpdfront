import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

export interface UploadErrorSnackbarData {
  message: string;
  log: string;
}

@Component({
  selector: 'app-upload-error-snackbar',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './upload-error-snackbar.html',
  styleUrl: './upload-error-snackbar.scss'
})
export class UploadErrorSnackbar {
  copied = false;

  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: UploadErrorSnackbarData,
    private snackBarRef: MatSnackBarRef<UploadErrorSnackbar>
  ) {}

  async copyLog(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.data.log);
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    } catch (err) {
      console.error('Impossible de copier le log', err);
    }
  }

  close(): void {
    this.snackBarRef.dismiss();
  }
}
