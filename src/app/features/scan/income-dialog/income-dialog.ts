import {AfterViewInit, Component, Inject, ElementRef, NgZone } from '@angular/core';
import { Income } from '../../../shared/models/income.model';
import { HttpClient } from '@angular/common/http';
import {MatDialogRef} from '@angular/material/dialog';
import {IncomeForm} from '../income-form/income-form';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ViewChild } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-income-dialog',
    imports: [
        IncomeForm,
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatDividerModule,
    ],
  templateUrl: './income-dialog.html',
  styleUrl: './income-dialog.css'
})
export class IncomeDialog implements AfterViewInit{

  private stream: MediaStream | null = null;
  step = 1;
  selectedFile: File | null = null;
  parsedIncome: Partial<Income> | null = null;
  loading = false;
  mode: 'upload' | 'camera' | 'manual' = 'upload';
  isDragOver = false;
  isMobileDevice = false;
  cameraWidth = 480;
  cameraHeight = 320;
  isImageWrong = false;
  errorMessage = 'Hubo un error procesando la imagen.';

  photoFile: File | null = null;

  @ViewChild(IncomeForm) incomeForm!: IncomeForm;
  @ViewChild('video', { static: false }) videoElementRef!: any;
  @ViewChild('canvas', { static: false }) canvasElementRef!: any;
  @ViewChild('previewCanvas', { static: false }) previewCanvasRef!: ElementRef<HTMLCanvasElement>;



  constructor(
    private http: HttpClient,
    private dialogRef: MatDialogRef<IncomeDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'upload' | 'camera' | 'manual' },
    private zone: NgZone
  ) {
    if (data.mode === 'manual') this.step = 2;
    this.mode = data.mode;

    // Detectar dispositivo móvil
    this.detectMobileDevice();
  }

  ngAfterViewInit() {
    if (this.mode === 'camera') {
      this.startCamera();
    }
  }

  // Agregar este fun para detectar dispositivos móviles:
  private detectMobileDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;

    this.isMobileDevice = isMobile || (hasTouch && isSmallScreen);

    // Ajustar dimensiones de cámara según el dispositivo
    if (this.isMobileDevice) {
      // Modo vertical para móviles
      this.cameraWidth = 300;
      this.cameraHeight = 400;
    } else {
      // Modo horizontal para desktop
      this.cameraWidth = 480;
      this.cameraHeight = 320;
    }
  }

  get dialogClass(): string {
    const baseClass = 'expense-dialog';

    if (this.mode === 'upload') {
      return `${baseClass} upload-step-${this.step}`;
    } else if (this.mode === 'camera') {
      return `${baseClass} camera-step-${this.step}`;
    } else if (this.mode === 'manual') {
      return `${baseClass} manual-step-${this.step}`;
    }

    return baseClass;
  }

  // Modifica el fun startCamera para mejor configuración:
  startCamera() {
    const video: HTMLVideoElement = this.videoElementRef.nativeElement;

    // Configuraciones de cámara según el dispositivo
    const constraints: MediaStreamConstraints = {
      video: {
        width: { ideal: this.cameraWidth },
        height: { ideal: this.cameraHeight },
        facingMode: this.isMobileDevice ? 'environment' : 'user', // Cámara trasera en móviles
        aspectRatio: this.isMobileDevice ? { ideal: 0.75 } : { ideal: 1.5 }
      }
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        this.stream = stream;
        video.srcObject = stream;
        video.play();
      })
      .catch(err => {
        console.error('Error accessing camera:', err);
        // Fallback: intentar con configuración básica
        navigator.mediaDevices.getUserMedia({ video: true })
          .then(stream => {
            this.stream = stream;
            video.srcObject = stream;
            video.play();
          })
          .catch(() => {
            alert('No se pudo acceder a la cámara. Verifica los permisos.');
          });
      });
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  // Modifica el fun capturePhoto para incluir la animación:
  capturePhoto() {
    console.log('[capturePhoto] Iniciando captura...');

    const video: HTMLVideoElement = this.videoElementRef.nativeElement;
    const canvas: HTMLCanvasElement = this.canvasElementRef.nativeElement;

    const context = canvas.getContext('2d');

    if (!context) {
      alert('Error al procesar la imagen');
      console.error('[capturePhoto] No se pudo obtener el contexto del canvas');
      return;
    }

    // Capturar la imagen en el canvas principal
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    console.log('[capturePhoto] Imagen dibujada en el canvas principal');

    // Detener la cámara
    this.stopCamera();
    console.log('[capturePhoto] Cámara detenida');

    // Activar loading
    this.loading = true;
    console.log('[capturePhoto] Loading activado, preparando animación...');

    // Después de activar loading, copiar la imagen al preview canvas
    setTimeout(() => {
      console.log('[capturePhoto] Ejecutando callback de setTimeout');

      const previewCanvas: HTMLCanvasElement = this.previewCanvasRef?.nativeElement;
      if (previewCanvas) {
        const previewContext = previewCanvas.getContext('2d');
        if (previewContext) {
          previewContext.drawImage(canvas, 0, 0, previewCanvas.width, previewCanvas.height);
          console.log('[capturePhoto] Imagen copiada al preview canvas');
        } else {
          console.error('[capturePhoto] No se pudo obtener contexto del preview canvas');
        }
      } else {
        console.warn('[capturePhoto] previewCanvasRef no definido');
      }

      // Procesar la imagen
      console.log('[capturePhoto] Enviando imagen a processReceiptAsync...');
      canvas.toBlob(blob => {
        if (blob) {
          console.log('[capturePhoto] Blob generado correctamente');
          const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
          this.photoFile = file;
          this.selectedFile = file;

          this.processReceiptAsync(file)
            .then(() => console.log('[capturePhoto] processReceiptAsync finalizó OK'))
            .catch(error => {
              console.error('[capturePhoto] Error en processReceiptAsync:', error);
              this.loading = false;
              alert('Error procesando la imagen');
              if (this.mode === 'camera') {
                this.startCamera();
              }
            });
        } else {
          console.error('[capturePhoto] No se pudo generar blob del canvas');
          this.loading = false;
          alert('Error capturando la imagen');
          if (this.mode === 'camera') {
            this.startCamera();
          }
        }
      }, 'image/jpeg', 0.9);
    }, 100);
  }

  processReceipt() {
    if (!this.selectedFile) return;
    this.loading = true;

    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);

    this.http.post<{ data: Partial<Income> }>('http://127.0.0.1:8000/api/movements/analyze-income/', formData)
      .subscribe({
        next: (res) => {
          console.log('Respuesta del análisis:', res);
          this.parsedIncome = res.data;
          this.step = 2;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          console.error('Error del backend:', err);

          let errorMessage = 'Error procesando la imagen';

          if (err.status === 400 && err.error) {
            errorMessage = err.error.message || this.getErrorMessageByCode(err.error.code);
          }

          this.isImageWrong = true;
          this.errorMessage = errorMessage;
        }
      });
  }

  private processReceiptAsync(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return new Promise((resolve, reject) => {
      this.http.post<{ data: Partial<Income> }>(
        'http://127.0.0.1:8000/api/movements/analyze-income/',
        formData
      ).subscribe({
        next: (res) => {
          this.zone.run(() => {
            this.parsedIncome = res.data;
            this.step = 2;
            this.loading = false;
          });

          resolve();
        },
        error: (err) => {
          console.error('Error recibido del backend:', err);

          this.zone.run(() => {
            this.loading = false;
          });

          let errorMessage = 'Error procesando la imagen';

          if (err.status === 400 && err.error) {
            errorMessage = err.error.message || this.getErrorMessageByCode(err.error.code);
          }

          this.isImageWrong = true;
          this.errorMessage = errorMessage;

          reject(new Error(errorMessage));
        }
      });
    });
  }

  private getErrorMessageByCode(code: string): string {
    const errorMessages: { [key: string]: string } = {
      'INVALID_IMAGE': 'La imagen no es válida. Verifica que sea un comprobante legible.',
      'INVALID_CATEGORY': 'No se pudo determinar la categoría.',
      'NO_IMAGE': 'No se envió ninguna imagen.',
      'EMPTY_RESPONSE': 'No se obtuvo respuesta del análisis.',
      'INVALID_JSON': 'Error en el formato de respuesta.',
      'MALFORMED_JSON': 'Respuesta malformada del servidor.',
      'UNEXPECTED_ERROR': 'Error inesperado durante el análisis.'
    };

    return errorMessages[code] || 'Error desconocido al procesar la imagen';
  }

  onSave(income: Income) {
    this.dialogRef.close(income);
  }

  close() {
    this.stopCamera();
    this.dialogRef.close(null);
  }

  onCancel() {
    if (this.mode === 'manual') {
      this.close();
    } else {
      this.step = 1;
      this.loading = false; // Asegurar que loading esté en false
      this.selectedFile = null; // Limpiar archivo seleccionado

      if (this.incomeForm) {
        this.incomeForm.resetForm();
      }

      if (this.mode === 'camera') {
        // Esperar un momento antes de reiniciar la cámara
        setTimeout(() => {
          this.startCamera();
        }, 300);
      }
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Validar que sea una imagen
      if (this.isValidImageFile(file)) {
        this.selectedFile = file;
      } else {
        alert('Por favor selecciona un archivo de imagen válido (JPEG, JPG, PNG)');
      }
    }
  }

  private isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    return validTypes.includes(file.type);
  }

  removeFile(event: Event) {
    event.stopPropagation(); // Evita que se abra el file picker
    this.selectedFile = null;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      if (this.isValidImageFile(file)) {
        this.selectedFile = file;
      } else {
        alert('Por favor selecciona un archivo de imagen válido (JPEG, JPG, PNG)');
        // Limpiar el input
        input.value = '';
      }
    }
  }
}
