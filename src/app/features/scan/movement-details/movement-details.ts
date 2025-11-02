import { Component, Inject, Output, EventEmitter, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, NgIf } from '@angular/common';
import { DisplayableMovement} from '../../../shared/models/displayable-movement.model';
import { ConfirmDeleteDialog } from '../confirm-delete-dialog/confirm-delete-dialog';
import { MovementService} from '../../../core/services/movement.service';
import { finalize } from 'rxjs/operators';


@Component({
  selector: 'app-movement-details',
  standalone: true,
  imports: [CommonModule, NgIf, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './movement-details.html',
  styleUrl: './movement-details.css'
})
export class MovementDetails implements OnInit {
  @Output() deleted = new EventEmitter<DisplayableMovement>();
  canDelete: boolean = true;
  isLoading: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<MovementDetails>,
    @Inject(MAT_DIALOG_DATA) public movement: DisplayableMovement,
    private dialog: MatDialog,
    private movementService: MovementService,
  ) {}

  ngOnInit(): void {
    this.checkIfCanDelete();
  }

  checkIfCanDelete(): void {
    if (!this.movement.created_at) {
      this.canDelete = true;
      return;
    }

    const createdDate = new Date(this.movement.created_at);
    const now = new Date();
    const diffInMs = now.getTime() - createdDate.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    this.canDelete = diffInDays <= 2;
  }

  close() {
    this.dialogRef.close();
  }

  confirmDelete() {
    const confirmRef = this.dialog.open(ConfirmDeleteDialog);

    confirmRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.isLoading = true;
        let request$;

        if (this.movement.type === 'income') {
          request$ = this.movementService.deleteIncome(this.movement.id);
        } else if (this.movement.type === 'expense') {
          request$ = this.movementService.deleteExpense(this.movement.id);
        }

        if (request$) {
          request$
            .pipe(finalize(() => (this.isLoading = false))) // ✅ siempre se ejecuta al final
            .subscribe({
              next: (res) => {
                if (res.success) {
                  this.deleted.emit(this.movement);
                  this.dialogRef.close();
                } else {
                  console.error(res.message);
                }
              },
              error: (err) => console.error('Error al eliminar:', err),
            });
        }
      }
    });
  }
}
