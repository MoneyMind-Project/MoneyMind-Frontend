import { Component, Inject, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, NgIf } from '@angular/common';
import { DisplayableMovement} from '../../../shared/models/displayable-movement.model';
import { ConfirmDeleteDialog } from '../confirm-delete-dialog/confirm-delete-dialog';
import { MovementService} from '../../../core/services/movement.service';

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
    private dialog: MatDialog,
    private movementService: MovementService
  ) {}

  close() {
    this.dialogRef.close();
  }

  confirmDelete() {
    const confirmRef = this.dialog.open(ConfirmDeleteDialog);

    confirmRef.afterClosed().subscribe((result) => {
      if (result === true) {
        let request$;

        if (this.movement.type === 'income') {
          request$ = this.movementService.deleteIncome(this.movement.id);
        } else if (this.movement.type === 'expense') {
          request$ = this.movementService.deleteExpense(this.movement.id);
        }

        if (request$) {
          request$.subscribe((res) => {
            if (res.success) {
              this.deleted.emit(this.movement); // avisa al padre
              this.dialogRef.close();
            } else {
              console.error(res.message);
            }
          });
        }
      }
    });
  }
}
