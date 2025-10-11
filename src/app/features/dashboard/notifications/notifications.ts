import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { ReportService } from '../../../core/services/report.service';
import { Notification} from '../../../shared/models/notification.model';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconButton} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    MatMenuModule,
    MatIconButton,
    MatIconModule
  ],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class Notifications implements OnInit {
  notifications: Notification[] = [];
  groupedNotifications: { today: Notification[], earlier: Notification[] } = { today: [], earlier: [] };
  loading = false;
  unreadCount = 0;
  activeTab: 'all' | 'unread' = 'all';

  constructor(
    private reportService: ReportService,
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.reportService.getUserAlerts().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.notifications = response.data;
          this.unreadCount = response.unread_count;
          this.groupNotifications();
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  groupNotifications(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.groupedNotifications = {
      today: [],
      earlier: []
    };

    this.notifications.forEach(notification => {
      const notifDate = new Date(notification.created_at);
      notifDate.setHours(0, 0, 0, 0);

      if (notifDate.getTime() === today.getTime()) {
        this.groupedNotifications.today.push(notification);
      } else {
        this.groupedNotifications.earlier.push(notification);
      }
    });
  }

  getFilteredNotifications(): Notification[] {
    if (this.activeTab === 'unread') {
      return this.notifications.filter(n => !n.seen);
    }
    return this.notifications;
  }

  setActiveTab(tab: 'all' | 'unread'): void {
    this.activeTab = tab;
    this.groupNotifications();
  }

  markAsRead(notification: Notification): void {
    if (!notification.seen) {
      // Aquí llamarías a tu servicio para marcar como leída
      notification.seen = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.seen = true);
    this.unreadCount = 0;
    // Aquí llamarías a tu servicio para marcar todas como leídas
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
}
