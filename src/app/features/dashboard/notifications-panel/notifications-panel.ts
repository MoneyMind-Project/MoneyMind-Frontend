import { Component, OnInit, ElementRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { ReportService} from '../../../core/services/report.service';
import {MatDialogRef} from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-notifications-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule
  ],
  templateUrl: './notifications-panel.html',
  styleUrl: './notifications-panel.css'
})
export class NotificationsPanel implements OnInit {
  notifications: any[] = [];
  loading = false;

  constructor(
    private reportService: ReportService,
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.reportService.getUserAlerts().subscribe({
      next: (response) => {
        if (response.success) {
          this.notifications = response.data;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
