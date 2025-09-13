import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-scan',
  imports: [
    FormsModule
  ],
  templateUrl: './scan.html',
  styleUrl: './scan.css'
})
export class Scan {
  selectedFile: File | null = null;

  constructor(private http: HttpClient) {}

  // Cuando selecciona una imagen
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('Archivo seleccionado:', this.selectedFile);
    }
  }
  // Enviar la imagen al backend
  onSubmit(): void {
    if (!this.selectedFile) {
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post('http://localhost:8000/api/receipts/upload/', formData)
      .subscribe({
        next: (response) => {
          console.log('Respuesta del backend ✅:', response);
        },
        error: (error) => {
          console.error('Error al enviar la imagen ❌:', error);
        }
      });
  }

  analyzeReceipt() {
    const formData = new FormData();
    if (this.selectedFile) {
      formData.append('file', this.selectedFile, this.selectedFile.name);

      this.http.post('http://127.0.0.1:8000/api/receipts/analyze/', formData)
        .subscribe({
          next: (res) => console.log('Respuesta Gemini:', res),
          error: (err) => console.error('Error Gemini:', err)
        });
    }
  }

}
