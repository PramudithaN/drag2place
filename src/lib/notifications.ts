import { soundFx } from './sound';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  cardId?: string;
  read: boolean;
}

class NotificationService {
  private notifications: AppNotification[] = [];
  private listeners: Array<(items: AppNotification[]) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('drag2place_notifications');
        if (stored) {
          this.notifications = JSON.parse(stored);
        }
      } catch {
        // LocalStorage fallback
      }
    }
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    const result = await Notification.requestPermission();
    return result;
  }

  public getPermissionStatus(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  public trigger(title: string, message: string, cardId?: string) {
    soundFx.playChime();

    const notif: AppNotification = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      message,
      timestamp: new Date().toISOString(),
      cardId,
      read: false,
    };

    this.notifications.unshift(notif);
    this.persist();
    this.notifyListeners();

    // Trigger native browser notification if granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico',
        });
      } catch {
        // Ignore fallback
      }
    }
  }

  public getNotifications(): AppNotification[] {
    return [...this.notifications];
  }

  public markAsRead(id: string) {
    this.notifications = this.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    this.persist();
    this.notifyListeners();
  }

  public markAllAsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    this.persist();
    this.notifyListeners();
  }

  public clearAll() {
    this.notifications = [];
    this.persist();
    this.notifyListeners();
  }

  public subscribe(listener: (items: AppNotification[]) => void) {
    this.listeners.push(listener);
    listener(this.getNotifications());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l(this.getNotifications()));
  }

  private persist() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('drag2place_notifications', JSON.stringify(this.notifications.slice(0, 50)));
      } catch {
        // Ignore quota
      }
    }
  }
}

export const notificationService = new NotificationService();
