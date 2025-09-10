import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {AppNavbar} from '../../../shared/components/app-navbar/app-navbar';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    AppNavbar,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout {

}
