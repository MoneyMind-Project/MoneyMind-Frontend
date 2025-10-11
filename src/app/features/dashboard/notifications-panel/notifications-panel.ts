import { Component, OnInit, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReportService } from '../../../core/services/report.service';
import { Notification} from '../../../shared/models/notification.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notifications-panel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notifications-panel.html',
  styleUrl: './notifications-panel.css'
})
export class NotificationsPanel implements OnInit {
  @Output() closePanel = new EventEmitter<void>();

  notifications: Notification[] = [];
  loading = false;
  unreadCount = 0;

  constructor(private reportService: ReportService, private router: Router) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    // Si el click es fuera del panel, cerrar
    if (!target.closest('.notification-panel') && !target.closest('.notifications-btn')) {
      this.closePanel.emit();
    }
  }

  loadNotifications(): void {
    this.loading = true;
    this.reportService.getUserAlerts().subscribe({
      next: (response: any) => {
        if (response.success) {
          // Tomar solo las primeras 5 notificaciones
          this.notifications = response.data.slice(0, 5);
          this.unreadCount = response.unread_count;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  markAsRead(notification: Notification, event: Event): void {
    event.stopPropagation();
    if (!notification.seen) {
      // Aquí llamarías a tu servicio para marcar como leída
      notification.seen = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    }
  }

  getAlertIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'risk': '⚠️',
      'warning': '⚡',
      'info': 'ℹ️',
      'success': '✓'
    };
    return icons[type] || 'ℹ️';
  }

  getAlertClass(type: string): string {
    return `alert-${type}`;
  }

  getTimeAgo(date: string): string {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours} h`;
    if (diffDays === 1) return '1 día';
    return `${diffDays} días`;
  }

  viewAllNotifications(): void {
    this.closePanel.emit();
    this.router.navigate(['dashboard/notifications']);
  }

  close(): void {
    this.closePanel.emit();
  }
}
