// sw.js - Service Worker for ARG Academy
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

let reminderTimeout = null;

self.addEventListener('message', (event) => {
    if (event.data.type === 'SCHEDULE_REMINDER') {
        const delay = event.data.delay || 5000; // 5 seconds default

        // Clear any existing timeout
        if (reminderTimeout) {
            clearTimeout(reminderTimeout);
        }

        reminderTimeout = setTimeout(() => {
            self.registration.showNotification('ARG Academy', {
                body: '¡No te rindas! Completa las actividades para seguir subiendo de nivel.',
                icon: '/favicon.png',
                badge: '/favicon.png',
                tag: 'activity-reminder',
                renotify: true,
                data: { url: '/dashboard' }
            });
            reminderTimeout = null;
        }, delay);
    }

    if (event.data.type === 'CANCEL_REMINDER') {
        if (reminderTimeout) {
            clearTimeout(reminderTimeout);
            reminderTimeout = null;
        }
    }
});

// Manejar push notifications
self.addEventListener('push', (event) => {
    console.log('Push recibido:', event);

    if (!event.data) {
        console.log('No hay datos en el push');
        return;
    }

    try {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: data.icon || '/logo.png',
            badge: data.badge || '/badge.png',
            tag: data.tag || 'notification',
            data: data.data || {},
            requireInteraction: data.requireInteraction || false,
            actions: [
                {
                    action: 'open',
                    title: 'Abrir',
                },
                {
                    action: 'close',
                    title: 'Cerrar',
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    } catch (error) {
        console.error('Error en push event:', error);
    }
});

self.addEventListener('notificationclick', (event) => {
    console.log('Notificación clickeada:', event.notification);

    event.notification.close();
    
    // Obtener la URL del data de la notificación
    const url = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Verificar si ya hay una ventana abierta
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }

            // Si no hay ventana abierta, abrir una nueva
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

self.addEventListener('notificationclose', (event) => {
    console.log('Notificación cerrada:', event.notification);
});
