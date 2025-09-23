import { Component, Inject, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, NgIf } from '@angular/common';
import { DisplayableMovement} from '../../../shared/models/displayable-movement.model';
import { ConfirmDeleteDialog } from '../confirm-delete-dialog/confirm-delete-dialog';

@Component({
  selector: 'app-movement-details',
  standalone: true,
  imports: [CommonModule, NgIf, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './movement-details.html',
  styleUrl: './movement-details.css'
})
export class MovementDetails {
  @Output() deleted = new EventEmitter<DisplayableMovement>();

  constructor(
    private dialogRef: MatDialogRef<MovementDetails>,
    @Inject(MAT_DIALOG_DATA) public movement: DisplayableMovement,
    private dialog: MatDialog
  ) {}

  close() {
    this.dialogRef.close();
  }

  confirmDelete() {
    const confirmRef = this.dialog.open(ConfirmDeleteDialog);

    confirmRef.afterClosed().subscribe((result) => {
      if (result === true) {
        // 👉 Aquí iría la llamada a tu API para borrar
        // this.api.deleteMovement(this.movement.id).subscribe(...)

        // Emitimos al padre para borrar también localmente
        this.deleted.emit(this.movement);
        this.dialogRef.close();
      }
    });
  }
}
