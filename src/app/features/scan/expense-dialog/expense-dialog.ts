import {AfterViewInit, Component, Inject} from '@angular/core';
import { Expense } from '../../../shared/models/expense.model';
import { HttpClient } from '@angular/common/http';
import {MatDialogRef} from '@angular/material/dialog';
import {ExpenseForm} from '../expense-form/expense-form';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ViewChild } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';


@Component({
  selector: 'app-expense-dialog',
  imports: [
    ExpenseForm,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule
  ],
  templateUrl: './expense-dialog.html',
  styleUrl: './expense-dialog.css'
})
export class ExpenseDialog implements AfterViewInit {

  private stream: MediaStream | null = null; // Añade esta propiedad
  step = 1;
  selectedFile: File | null = null;
  parsedExpense: Partial<Expense> | null = null;
  loading = false;
  mode: 'upload' | 'camera' | 'manual' = 'upload';

  photoFile: File | null = null;

  @ViewChild(ExpenseForm) expenseForm!: ExpenseForm;
  @ViewChild('video', { static: false }) videoElementRef!: any;
  @ViewChild('canvas', { static: false }) canvasElementRef!: any;


  constructor(
    private http: HttpClient,
    private dialogRef: MatDialogRef<ExpenseDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'upload' | 'camera' | 'manual' }
  ) {
    if (data.mode === 'manual') this.step = 2;
    this.mode = data.mode;
  }

  ngAfterViewInit() {
    if (this.mode === 'camera') {
      this.startCamera();
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.selectedFile = input.files[0];
  }

  processReceipt() {
    if (!this.selectedFile) return;
    this.loading = true;

    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);

    this.http.post<{ data: Partial<Expense> }>('http://127.0.0.1:8000/api/movements/analyze-expense/', formData)
      .subscribe({
        next: (res) => {
          console.log(res);
          this.parsedExpense = res.data;
          this.step = 2;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          alert('Error procesando con Gemini');
        }
      });
  }

  startCamera() {
    const video: HTMLVideoElement = this.videoElementRef.nativeElement;
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        this.stream = stream; // Guarda referencia al stream
        video.srcObject = stream;
        video.play();
      })
      .catch(err => {
        alert('No se pudo acceder a la cámara');
      });
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  capturePhoto() {
    const video: HTMLVideoElement = this.videoElementRef.nativeElement;
    const canvas: HTMLCanvasElement = this.canvasElementRef.nativeElement;
    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Detener la cámara primero
    this.stopCamera();
    this.loading = true;

    // Usar Promise para manejar el blob
    new Promise<File>((resolve, reject) => {
      canvas.toBlob(blob => {
        if (blob) {
          resolve(new File([blob], 'photo.jpg', { type: 'image/jpeg' }));
        } else {
          reject('Error creating blob');
        }
      }, 'image/jpeg');
    })
      .then(file => {
        this.photoFile = file;
        this.selectedFile = file;
        return this.processReceiptAsync(file); // Convertir processReceipt a Promise
      })
      .catch(error => {
        this.loading = false;
        alert('Error procesando la imagen');
      });
  }

  // Nuevo método que retorna una Promise
  private processReceiptAsync(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return new Promise((resolve, reject) => {
      this.http.post<{ data: Partial<Expense> }>('http://127.0.0.1:8000/api/movements/analyze-expense/', formData)
        .subscribe({
          next: (res) => {
            this.parsedExpense = res.data;
            this.step = 2;
            this.loading = false;
            resolve();
          },
          error: (err) => {
            this.loading = false;
            reject(err);
          }
        });
    });
  }


  onSave(expense: Expense) {
    this.dialogRef.close(expense);
  }


  // Asegúrate de detener la cámara al cerrar el diálogo
  close() {
    this.stopCamera();
    this.dialogRef.close(null);
  }


  onCancel() {
    if (this.mode === 'manual') {
      this.close();
    } else {
      this.step = 1;
      this.expenseForm.resetForm();
      if (this.mode === 'camera') {
        this.startCamera(); // Reinicia la cámara si volvemos al paso 1
      }
    }
  }
}

