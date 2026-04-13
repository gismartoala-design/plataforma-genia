import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle2, AlertCircle, Save, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface NotificationPreference {
  reminders: boolean;
  reminderTime: string; // HH:MM format
  progressUpdates: boolean;
  achievements: boolean;
  pendingTasks: boolean;
  adminMessages: boolean;
}

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreference>({
    reminders: true,
    reminderTime: '08:00',
    progressUpdates: true,
    achievements: true,
    pendingTasks: true,
    adminMessages: true,
  });

  const [hasPermission, setHasPermission] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setHasPermission(Notification.permission === 'granted');
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: 'Error',
        description: 'Tu navegador no soporta notificaciones',
        variant: 'destructive'
      });
      return;
    }

    if (Notification.permission === 'granted') {
      setHasPermission(true);
      return;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      setHasPermission(permission === 'granted');

      if (permission === 'granted') {
        toast({
          title: '¡Éxito!',
          description: 'Notificaciones activadas correctamente'
        });
      }
    }
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      // Future: Save preferences to backend
      // await studentApi.updateNotificationSettings(preferences);
      
      localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
      
      toast({
        title: '¡Guardado!',
        description: 'Tus preferencias de notificación fueron actualizadas'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron guardar las preferencias',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const togglePreference = (key: keyof NotificationPreference) => {
    if (key !== 'reminderTime') {
      setPreferences(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    }
  };

  const notificationOptions = [
    {
      key: 'reminders' as const,
      label: 'Recordatorios Diarios',
      icon: '⏰',
      description: 'Recibir recordatorios a la hora programada',
      hasTime: true
    },
    {
      key: 'progressUpdates' as const,
      label: 'Actualizaciones de Progreso',
      icon: '📈',
      description: 'Notificaciones sobre tu avance en módulos'
    },
    {
      key: 'achievements' as const,
      label: 'Logros y Badges',
      icon: '🏆',
      description: 'Celebración de tus nuevos logros'
    },
    {
      key: 'pendingTasks' as const,
      label: 'Tareas Pendientes',
      icon: '📋',
      description: 'Alertas de tareas sin completar'
    },
    {
      key: 'adminMessages' as const,
      label: 'Mensajes del Administrador',
      icon: '📢',
      description: 'Anuncios y mensajes importantes'
    }
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Permission Card */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={cn(
              'w-12 h-12 rounded-lg flex items-center justify-center text-xl',
              hasPermission
                ? 'bg-emerald-200 text-emerald-700'
                : 'bg-orange-200 text-orange-700'
            )}>
              {hasPermission ? '✅' : '⚠️'}
            </div>
            <div className="flex-1">
              <h3 className="font-black text-slate-800 mb-1">
                {hasPermission ? 'Notificaciones Activadas' : 'Autorizar Notificaciones'}
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                {hasPermission
                  ? 'Eres receptor activo de notificaciones del sistema'
                  : 'Necesitamos tu autorización para enviarte notificaciones'}
              </p>
              {!hasPermission && (
                <Button
                  onClick={requestNotificationPermission}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  <Bell className="w-4 h-4" />
                  Activar Notificaciones
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences Card */}
      <Card className="border border-slate-200">
        <CardHeader className="border-b bg-slate-50">
          <h3 className="font-black text-slate-800 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Preferencias de Notificaciones
          </h3>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {notificationOptions.map((option) => (
            <div
              key={option.key}
              className={cn(
                'p-4 rounded-xl border-2 transition-all cursor-pointer',
                preferences[option.key]
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-slate-200 bg-slate-50'
              )}
              onClick={() => togglePreference(option.key)}
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl mt-1">{option.icon}</div>
                <div className="flex-1">
                  <h4 className="font-black text-slate-800 mb-1">{option.label}</h4>
                  <p className="text-xs text-slate-600">{option.description}</p>

                  {option.hasTime && preferences.reminders && (
                    <div className="mt-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <input
                        type="time"
                        value={preferences.reminderTime}
                        onChange={(e) =>
                          setPreferences(prev => ({
                            ...prev,
                            reminderTime: e.target.value
                          }))
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1 rounded border border-blue-300 text-sm font-bold"
                      />
                    </div>
                  )}
                </div>
                <div className={cn(
                  'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                  preferences[option.key]
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-slate-300'
                )}>
                  {preferences[option.key] && (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-black text-emerald-900 uppercase">Privacidad</p>
                <p className="text-xs text-emerald-700 mt-1">
                  Tus preferencias son privadas y solo se usan para notificaciones
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-black text-blue-900 uppercase">Aviso</p>
                <p className="text-xs text-blue-700 mt-1">
                  Algunos mensajes importantes siempre se enviarán
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex gap-3 justify-end pt-4">
        <Button
          onClick={handleSavePreferences}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-bold"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Guardando...' : 'Guardar Preferencias'}
        </Button>
      </div>
    </div>
  );
}
