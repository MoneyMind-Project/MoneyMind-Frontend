import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './confirm-delete-dialog.html',
  styleUrl: './confirm-delete-dialog.css'
})
export class ConfirmDeleteDialog {
  constructor(private dialogRef: MatDialogRef<ConfirmDeleteDialog>) {}
  close(result: boolean) {
    this.dialogRef.close(result);
  }
}
