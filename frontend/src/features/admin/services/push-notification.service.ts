// Push Notification Service
interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
}

interface ScheduledNotification {
  id: string;
  title: string;
  message: string;
  url?: string;
  hour: number;
  minute: number;
  studentIds: string[];
  active: boolean;
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private isSupported = () => 'serviceWorker' in navigator && 'PushManager' in window;

  static getInstance(): PushNotificationService {
    if (!this.instance) {
      this.instance = new PushNotificationService();
    }
    return this.instance;
  }

  /**
   * Registra el dispositivo para recibir notificaciones push
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      console.warn('Push notifications no soportadas en este navegador');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await this.setupNotifications();
    }
    return permission;
  }

  /**
   * Configura el service worker para notificaciones
   */
  private async setupNotifications(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        const newSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY || ''
        });
        // Aquí guardarías la suscripción en tu backend
        await this.savePushSubscription(newSubscription);
      }
    } catch (error) {
      console.error('Error setting up push notifications:', error);
    }
  }

  /**
   * Guarda la suscripción en el backend
   */
  private async savePushSubscription(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/push-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });
      if (!response.ok) {
        throw new Error('Error saving subscription');
      }
    } catch (error) {
      console.error('Error saving push subscription:', error);
    }
  }

  /**
   * Envía una notificación local (fallback)
   */
  async sendLocalNotification(payload: NotificationPayload): Promise<void> {
    if (Notification.permission !== 'granted') {
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/logo.png',
      badge: payload.badge || '/badge.png',
      tag: payload.tag || 'notification',
      data: payload.data,
      requireInteraction: payload.tag?.includes('reminder') || false
    });
  }

  /**
   * Envía una notificación de recordatorio
   */
  async sendReminderNotification(
    studentId: string,
    moduleName: string,
    taskName: string,
    dueDate: Date
  ): Promise<void> {
    const payload: NotificationPayload = {
      title: `⏰ Recordatorio: ${moduleName}`,
      body: `No olvides completar: ${taskName}. Vencimiento: ${this.formatDate(dueDate)}`,
      icon: '/icons/reminder.png',
      tag: `reminder-${studentId}`,
      data: {
        moduleId: moduleName,
        taskName,
        dueDate: dueDate.toISOString(),
        action: 'open-module'
      }
    };

    await this.sendLocalNotification(payload);
  }

  /**
   * Envía notificación de progreso
   */
  async sendProgressNotification(
    studentName: string,
    progress: number,
    moduleName: string
  ): Promise<void> {
    const payload: NotificationPayload = {
      title: `🎯 ¡Hola ${studentName}!`,
      body: `Vas ${progress}% en ${moduleName}. ¡Sigue adelante!`,
      icon: '/icons/progress.png',
      data: { type: 'progress', progress }
    };

    await this.sendLocalNotification(payload);
  }

  /**
   * Envía notificación de logro
   */
  async sendAchievementNotification(
    studentName: string,
    achievement: string,
    points: number
  ): Promise<void> {
    const payload: NotificationPayload = {
      title: `🏆 ¡Logro Desbloqueado!`,
      body: `${studentName}, obtuviste: ${achievement} (+${points} puntos)`,
      icon: '/icons/achievement.png',
      tag: `achievement-${Date.now()}`,
      data: { type: 'achievement', achievement, points }
    };

    await this.sendLocalNotification(payload);
  }

  /**
   * Envía notificación de tareas pendientes
   */
  async sendPendingTasksNotification(pendingCount: number): Promise<void> {
    const payload = {
      title: `📋 Tareas Pendientes`,
      body: `Tienes ${pendingCount} tareas por completar. ¡No las olvides!`,
      icon: '/icons/tasks.png',
      tag: 'pending-tasks',
      requireInteraction: true
    } as NotificationPayload & { requireInteraction?: boolean };

    await this.sendLocalNotification(payload);
  }

  /**
   * Envía una notificación personalizada del administrador
   */
  async sendAdminNotification(title: string, message: string, url?: string): Promise<void> {
    const payload: NotificationPayload = {
      title,
      body: message,
      icon: '/icons/admin.png',
      tag: `admin-${Date.now()}`,
      data: { 
        type: 'admin', 
        timestamp: new Date().toISOString(),
        url: url || ''
      }
    };

    await this.sendLocalNotification(payload);
  }

  /**
   * Programa una notificación automática diaria
   */
  scheduleDailyAdminNotification(
    title: string,
    message: string,
    url: string,
    hour: number = 8,
    minute: number = 0,
    studentIds: string[] = []
  ): string {
    const notificationId = `scheduled-${Date.now()}`;
    
    const scheduleNext = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(hour, minute, 0, 0);

      if (now >= target) {
        target.setDate(target.getDate() + 1);
      }

      const timeUntilNotification = target.getTime() - now.getTime();
      
      const timeoutId = setTimeout(async () => {
        // Enviar notificación a todos los estudiantes seleccionados
        if (studentIds.length > 0) {
          for (const studentId of studentIds) {
            await this.sendAdminNotification(title, message, url);
          }
        } else {
          // Si no hay estudiantes específicos, enviar a todos
          await this.sendAdminNotification(title, message, url);
        }
        
        // Programar la siguiente notificación
        scheduleNext();
      }, timeUntilNotification);

      // Guardar el timeout ID para poder cancelarlo después
      localStorage.setItem(`notification-timeout-${notificationId}`, String(timeoutId));
    };

    // Guardar la configuración de la notificación programada
    const scheduledConfig: ScheduledNotification = {
      id: notificationId,
      title,
      message,
      url,
      hour,
      minute,
      studentIds,
      active: true
    };
    localStorage.setItem(`scheduled-${notificationId}`, JSON.stringify(scheduledConfig));

    scheduleNext();
    return notificationId;
  }

  /**
   * Cancela una notificación programada
   */
  cancelDailyNotification(notificationId: string): void {
    try {
      const timeoutId = localStorage.getItem(`notification-timeout-${notificationId}`);
      if (timeoutId) {
        clearTimeout(Number(timeoutId));
      }
      localStorage.removeItem(`scheduled-${notificationId}`);
      localStorage.removeItem(`notification-timeout-${notificationId}`);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  /**
   * Obtiene todas las notificaciones programadas
   */
  getScheduledNotifications(): ScheduledNotification[] {
    const scheduled: ScheduledNotification[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('scheduled-') && !key.includes('timeout')) {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            scheduled.push(JSON.parse(item));
          } catch (e) {
            console.error('Error parsing scheduled notification:', e);
          }
        }
      }
    }
    return scheduled;
  }

  /**
   * Programa recordatorios automáticos
   */
  scheduleDailyReminder(hour: number = 8, minute: number = 0): void {
    const checkReminders = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(hour, minute, 0, 0);

      if (now >= target) {
        target.setDate(target.getDate() + 1);
      }

      const timeUntilReminder = target.getTime() - now.getTime();
      
      setTimeout(() => {
        this.sendPendingTasksNotification(3);
        checkReminders(); // Programa el próximo recordatorio
      }, timeUntilReminder);
    };

    checkReminders();
  }

  /**
   * Desuscribe del servicio de notificaciones
   */
  async unsubscribe(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
    }
  }

  /**
   * Utilidad para formatear fechas
   */
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-AR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  /**
   * Obtiene el estado actual de permisos
   */
  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  /**
   * Verifica si las notificaciones están habilitadas
   */
  isEnabled(): boolean {
    return this.isSupported() && Notification.permission === 'granted';
  }
}

export default PushNotificationService.getInstance();
