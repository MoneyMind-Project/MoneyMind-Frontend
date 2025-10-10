import { Component, EventEmitter, Output } from '@angular/core';
import {MatCard, MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-terms',
  imports: [
    MatCardModule,
    MatCheckboxModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './terms.html',
  styleUrl: './terms.css'
})
export class Terms {
}
