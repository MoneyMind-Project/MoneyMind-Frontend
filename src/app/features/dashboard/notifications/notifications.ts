import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { AlertService} from '../../../core/services/alert.service';
import { Notification } from '../../../shared/models/notification.model';
import {PaginatedNotificationsResponse} from '../../../shared/models/response.model';
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
  loadingMore = false;
  unreadCount = 0;
  activeTab: 'all' | 'unread' = 'all';

  // Paginación
  page = 1;
  pageSize = 6;
  hasMore = false;

  constructor(
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.loadNotifications(true);
  }

  loadNotifications(reset: boolean = false): void {
    if (reset) {
      this.loading = true;
      this.page = 1;
      this.notifications = [];
    } else {
      this.loadingMore = true;
    }

    this.alertService.getUserAlertsPagination(this.page, this.pageSize).subscribe({
      next: (response: PaginatedNotificationsResponse) => {
        if (response.success) {
          // Si es reset, reemplazar. Si no, agregar al final
          if (reset) {
            this.notifications = response.data as Notification[];
          } else {
            this.notifications = [...this.notifications, ...(response.data as Notification[])];
          }

          this.unreadCount = response.unread_count;
          this.hasMore = response.pagination.has_more;

          // Si hay más, preparar la siguiente página
          if (response.pagination.next_page) {
            this.page = response.pagination.next_page;
          }

          this.groupNotifications();
        }
        this.loading = false;
        this.loadingMore = false;
      },
      error: () => {
        this.loading = false;
        this.loadingMore = false;
      }
    });
  }

  loadMore(): void {
    if (this.hasMore && !this.loadingMore) {
      this.loadNotifications(false);
    }
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
      this.alertService.markAlertAsSeen(notification.id).subscribe({
        next: (res) => {
          if (res.success) {
            notification.seen = true;
            this.unreadCount = Math.max(0, this.unreadCount - 1);
            console.log(`✅ Alerta ${notification.id} marcada como vista.`);
          } else {
            console.warn(`⚠️ No se pudo marcar la alerta ${notification.id} como vista.`);
          }
        },
        error: (err) => {
          console.error(`❌ Error al marcar la alerta ${notification.id} como vista:`, err);
        }
      });
    }
  }

  markAllAsRead(): void {
    this.alertService.markAllRiskAlertsAsSeen().subscribe({
      next: (res) => {
        if (res.success) {
          // Actualizar estado local
          this.notifications.forEach(n => {
            if (n.alert_type === 'risk') n.seen = true;
          });
          this.unreadCount = Math.max(0, this.unreadCount - res.updated_count);
          console.log(`✅ ${res.updated_count} alertas de tipo 'risk' marcadas como vistas.`);
        } else {
          console.warn('⚠️ No se pudieron marcar las alertas como vistas.');
        }
      },
      error: (err) => {
        console.error('❌ Error al marcar todas las alertas risk como vistas:', err);
      }
    });
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
