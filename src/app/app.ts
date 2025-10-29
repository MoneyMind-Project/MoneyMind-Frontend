import { Component, signal, OnInit  } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgToastComponent, NgToastService, TOAST_POSITIONS, ToastPosition } from 'ng-angular-popup';
import { OneSignalService} from './core/services/onesignal.service';

declare global {
  interface Window {
    OneSignalDeferred?: any[];
    OneSignal?: any;
  }
}



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('moneymind');
  constructor(private oneSignal: OneSignalService) {}

  ngOnInit(): void {
    this.oneSignal.init();
  }
}
