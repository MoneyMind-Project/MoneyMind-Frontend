import { Component } from '@angular/core';
import {MatToolbar} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-app-navbar',
  imports: [
    MatToolbar,
    MatIconModule,
    MatButton,
    RouterLink,
    MatIconButton
  ],
  templateUrl: './app-navbar.html',
  styleUrl: './app-navbar.css'
})
export class AppNavbar {

}
