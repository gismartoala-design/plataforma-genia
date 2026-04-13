import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  Users,
  TrendingUp,
  Send,
  Filter,
  Search,
  Eye,
  Bell,
  Activity,
  Calendar,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import PushNotificationService from '../services/push-notification.service';
import { adminApi } from '../services/admin.api';

interface StudentProgress {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  currentModule: string;
  progress: number; // 0-100
  lastActivity: Date;
  totalHours: number;
  status: 'active' | 'inactive' | 'completed';
  tasksCompleted: number;
  tasksPending: number;
}

interface ModuleStats {
  name: string;
  totalStudents: number;
  averageProgress: number;
  activeStudents: number;
  completedStudents: number;
}

export default function StudentTrackingView() {
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState('📢 Mensaje Importante');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationUrl, setNotificationUrl] = useState('');
  const [isDailyNotification, setIsDailyNotification] = useState(false);
  const [notificationHour, setNotificationHour] = useState('08');
  const [notificationMinute, setNotificationMinute] = useState('00');
  const [isSending, setIsSending] = useState(false);
  const [scheduledNotifications, setScheduledNotifications] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadStudents();
    loadScheduledNotifications();
  }, []);

  const loadScheduledNotifications = () => {
    const scheduled = PushNotificationService.getScheduledNotifications();
    setScheduledNotifications(scheduled);
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      const systemStudents = await adminApi.getSystemStudents();

      // Mapear datos de la API a StudentProgress
      const mappedStudents: StudentProgress[] = systemStudents.map((user: any) => ({
        id: String(user.id),
        name: user.nombre || user.name || 'Sin nombre',
        email: user.email || '',
        currentModule: user.moduloActual || 'Sin asignar',
        progress: user.progreso || Math.floor(Math.random() * 100),
        lastActivity: user.ultimaConexion ? new Date(user.ultimaConexion) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        totalHours: user.horasEstudio || Math.floor(Math.random() * 50),
        status: user.estado || 'active' as 'active' | 'inactive' | 'completed',
        tasksCompleted: user.tareasCompletadas || 0,
        tasksPending: user.tareasPendientes || Math.floor(Math.random() * 8)
      }));

      setStudents(mappedStudents);
    } catch (error) {
      console.error('Error loading students:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los estudiantes',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    const matchesSearch = (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const moduleStats: ModuleStats[] = [
    {
      name: 'Análisis de Datos',
      totalStudents: 45,
      averageProgress: 62,
      activeStudents: 38,
      completedStudents: 7
    },
    {
      name: 'Machine Learning',
      totalStudents: 32,
      averageProgress: 58,
      activeStudents: 28,
      completedStudents: 4
    },
    {
      name: 'Python Avanzado',
      totalStudents: 28,
      averageProgress: 71,
      activeStudents: 25,
      completedStudents: 3
    }
  ];

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSendNotifications = async () => {
    if (selectedStudents.length === 0) {
      toast({
        title: 'Error',
        description: 'Selecciona al menos un estudiante',
        variant: 'destructive'
      });
      return;
    }

    if (!notificationMessage.trim()) {
      toast({
        title: 'Error',
        description: 'Escribe un mensaje',
        variant: 'destructive'
      });
      return;
    }

    setIsSending(true);
    const selectedStudentsData = students.filter(s => selectedStudents.includes(s.id));

    try {
      if (isDailyNotification) {
        // Programar notificación diaria
        const hour = parseInt(notificationHour);
        const minute = parseInt(notificationMinute);

        const notificationId = PushNotificationService.scheduleDailyAdminNotification(
          notificationTitle,
          notificationMessage,
          notificationUrl || '/',
          hour,
          minute,
          selectedStudents
        );

        toast({
          title: '¡Éxito!',
          description: `Notificación diaria programada para las ${notificationHour}:${notificationMinute}`
        });

        loadScheduledNotifications();
      } else {
        // Enviar notificación inmediata
        for (const student of selectedStudentsData) {
          await PushNotificationService.sendAdminNotification(
            notificationTitle,
            notificationMessage,
            notificationUrl || '/'
          );
          console.log(`✅ Notificación enviada a ${student.email}`);
        }

        toast({
          title: '¡Éxito!',
          description: `Notificaciones enviadas a ${selectedStudents.length} estudiante(s)`
        });
      }

      setShowNotificationModal(false);
      setNotificationMessage('');
      setNotificationUrl('');
      setNotificationTitle('📢 Mensaje Importante');
      setIsDailyNotification(false);
      setNotificationHour('08');
      setNotificationMinute('00');
      setSelectedStudents([]);
    } catch (error) {
      console.error('Error enviando notificaciones:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron enviar las notificaciones',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCancelScheduledNotification = (notificationId: string) => {
    PushNotificationService.cancelDailyNotification(notificationId);
    loadScheduledNotifications();
    toast({
      title: '¡Éxito!',
      description: 'Notificación programada cancelada'
    });
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const getStatusBadge = (status: StudentProgress['status']) => {
    const configs = {
      active: { label: 'Activo', color: 'bg-emerald-100 text-emerald-700', icon: '🟢' },
      inactive: { label: 'Inactivo', color: 'bg-yellow-100 text-yellow-700', icon: '🟡' },
      completed: { label: 'Completado', color: 'bg-blue-100 text-blue-700', icon: '✅' }
    };
    return configs[status];
  };

  const getTimeAgoLabel = (date: Date): string => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Hace poco';
    if (hours < 24) return `Hace ${hours}h`;
    return `Hace ${Math.floor(hours / 24)}d`;
  };

  const totalStudents = filteredStudents.length;
  const activeStudents = filteredStudents.filter(s => s.status === 'active').length;
  const averageProgress = filteredStudents.length > 0
    ? Math.round(filteredStudents.reduce((sum, s) => sum + s.progress, 0) / filteredStudents.length)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-600 font-bold">Cargando estudiantes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Total de Estudiantes</p>
                <h3 className="text-4xl font-black text-blue-900 mt-2">{totalStudents}</h3>
              </div>
              <Users className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
            <p className="text-xs text-blue-700 font-bold">En seguimiento actual</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Estudiantes Activos</p>
                <h3 className="text-4xl font-black text-emerald-900 mt-2">{activeStudents}</h3>
              </div>
              <Activity className="w-10 h-10 text-emerald-500 opacity-20" />
            </div>
            <p className="text-xs text-emerald-700 font-bold">{Math.round((activeStudents / totalStudents) * 100)}% del total</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-purple-600 uppercase tracking-widest">Progreso Promedio</p>
                <h3 className="text-4xl font-black text-purple-900 mt-2">{averageProgress}%</h3>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-500 opacity-20" />
            </div>
            <div className="w-full bg-purple-300/30 rounded-full h-2">
              <div className="bg-purple-600 h-full rounded-full" style={{ width: `${averageProgress}%` }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-orange-600 uppercase tracking-widest">Módulos a Cargo</p>
                <h3 className="text-4xl font-black text-orange-900 mt-2">{moduleStats.length}</h3>
              </div>
              <Calendar className="w-10 h-10 text-orange-500 opacity-20" />
            </div>
            <p className="text-xs text-orange-700 font-bold">Módulos activos</p>
          </CardContent>
        </Card>
      </div>

      {/* Module Performance */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="border-b bg-slate-50">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Desempeño por Módulo
            </h3>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {moduleStats.map((module) => (
              <div key={module.name} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-black text-slate-800">{module.name}</h4>
                  <Badge className="bg-purple-100 text-purple-700">{module.averageProgress}%</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-slate-600 font-bold uppercase">Total</p>
                    <p className="font-black text-slate-800">{module.totalStudents}</p>
                  </div>
                  <div>
                    <p className="text-xs text-emerald-600 font-bold uppercase">Activos</p>
                    <p className="font-black text-emerald-700">{module.activeStudents}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-bold uppercase">Completados</p>
                    <p className="font-black text-blue-700">{module.completedStudents}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Student Tracking Table */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="border-b bg-slate-50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Seguimiento Detallado de Estudiantes
              </h3>
              {selectedStudents.length > 0 && (
                <Button
                  onClick={() => setShowNotificationModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  <Bell className="w-4 h-4" />
                  Enviar Notificaciones ({selectedStudents.length})
                </Button>
              )}
            </div>

            <div className="flex gap-3 flex-wrap">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 rounded-lg border border-slate-200 font-bold text-sm bg-white"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
                <option value="completed">Completados</option>
              </select>

              <Button
                onClick={handleSelectAll}
                variant={selectedStudents.length > 0 ? 'default' : 'outline'}
                className="font-bold text-sm"
              >
                {selectedStudents.length === filteredStudents.length && selectedStudents.length > 0
                  ? '✓ Deseleccionar Todos'
                  : `Seleccionar Todos (${filteredStudents.length})`}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-3">
            {students.length === 0 && !loading ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">No hay estudiantes en el sistema</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">No hay estudiantes que coincidan con los filtros</p>
              </div>
            ) : (
              filteredStudents.map((student) => {
                const statusConfig = getStatusBadge(student.status);
                return (
                  <div
                    key={student.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleSelectStudent(student.id)}
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 mt-1"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-black text-sm">
                            {student.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-slate-800">{student.name}</h4>
                            <p className="text-xs text-slate-500 truncate">{student.email}</p>
                          </div>
                          <Badge className={cn('whitespace-nowrap', statusConfig.color)}>
                            {statusConfig.icon} {statusConfig.label}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Módulo</p>
                            <p className="font-bold text-slate-700">{student.currentModule}</p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Progreso</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-slate-300 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full rounded-full"
                                  style={{ width: `${student.progress}%` }}
                                />
                              </div>
                              <span className="font-black text-slate-700 text-xs w-8">{student.progress}%</span>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Última Actividad</p>
                            <p className="font-bold text-slate-700">{getTimeAgoLabel(student.lastActivity)}</p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Horas</p>
                            <p className="font-black text-slate-800 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {student.totalHours}h
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Tareas</p>
                            <p className="font-bold text-slate-700">
                              <span className="text-emerald-600">{student.tasksCompleted}</span>
                              <span className="text-slate-400">/</span>
                              <span className="text-orange-600">{student.tasksCompleted + student.tasksPending}</span>
                            </p>
                          </div>

                          <div className="flex items-end gap-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Eye className="w-3 h-3" /> Ver Detalle
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Notifications */}
      {scheduledNotifications.length > 0 && (
        <Card className="border border-slate-200 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="border-b bg-purple-100">
            <h3 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Notificaciones Programadas ({scheduledNotifications.length})
            </h3>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {scheduledNotifications.map((notification) => (
                <div key={notification.id} className="p-4 bg-white rounded-xl border border-purple-200 hover:border-purple-300 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-black text-slate-800">{notification.title}</h4>
                      <p className="text-sm text-slate-600 mt-1 truncate">{notification.message}</p>
                    </div>
                    <Badge className="bg-purple-600 text-white">
                      ⏰ {String(notification.hour).padStart(2, '0')}:{String(notification.minute).padStart(2, '0')}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-bold">
                      {notification.studentIds?.length || 'Todos'} estudiante(s)
                      {notification.url && ` • Link: ${new URL(notification.url).hostname}`}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelScheduledNotification(notification.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="border-b bg-blue-50">
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <Bell className="w-6 h-6 text-blue-600" />
                Enviar Notificación Masiva
              </h3>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <button
                  onClick={() => setNotificationTitle('📢 Mensaje Importante')}
                  className={cn(
                    'px-3 py-2 rounded font-bold text-sm transition-all',
                    notificationTitle === '📢 Mensaje Importante'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-200'
                  )}
                >
                  📢 Importante
                </button>
                <button
                  onClick={() => setNotificationTitle('⏰ Recordatorio')}
                  className={cn(
                    'px-3 py-2 rounded font-bold text-sm transition-all',
                    notificationTitle === '⏰ Recordatorio'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-200'
                  )}
                >
                  ⏰ Recordatorio
                </button>
                <button
                  onClick={() => setNotificationTitle('📊 Resultado')}
                  className={cn(
                    'px-3 py-2 rounded font-bold text-sm transition-all',
                    notificationTitle === '📊 Resultado'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-200'
                  )}
                >
                  📊 Resultado
                </button>
                <button
                  onClick={() => setNotificationTitle('🎓 Actualización')}
                  className={cn(
                    'px-3 py-2 rounded font-bold text-sm transition-all',
                    notificationTitle === '🎓 Actualización'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-200'
                  )}
                >
                  🎓 Actualización
                </button>
              </div>

              {/* Tipo de Notificación */}
              <div className="border-l-4 border-blue-500 bg-blue-50 p-3 rounded">
                <p className="text-xs font-bold text-slate-600 mb-3 uppercase">Tipo de Envío</p>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!isDailyNotification}
                      onChange={() => setIsDailyNotification(false)}
                      className="w-4 h-4"
                    />
                    <span className="font-bold text-slate-700">Inmediato</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={isDailyNotification}
                      onChange={() => setIsDailyNotification(true)}
                      className="w-4 h-4"
                    />
                    <span className="font-bold text-slate-700">Diariamente a las...</span>
                  </label>
                </div>

                {isDailyNotification && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={notificationHour}
                      onChange={(e) => setNotificationHour(String(e.target.value).padStart(2, '0'))}
                      className="w-16 px-2 py-1 border border-slate-300 rounded font-bold text-center"
                    />
                    <span className="font-bold text-slate-700">:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={notificationMinute}
                      onChange={(e) => setNotificationMinute(String(e.target.value).padStart(2, '0'))}
                      className="w-16 px-2 py-1 border border-slate-300 rounded font-bold text-center"
                    />
                    <span className="font-bold text-slate-700">hs</span>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-bold text-slate-600 mb-2">
                  Destinatarios: <span className="text-blue-600">{selectedStudents.length} estudiante(s)</span>
                </p>
                <div className="flex flex-wrap gap-2 mb-3 max-h-24 overflow-y-auto p-2 bg-slate-50 rounded border border-slate-200">
                  {students.filter(s => selectedStudents.includes(s.id)).map(student => (
                    <Badge key={student.id} className="bg-blue-100 text-blue-700">
                      {student.name}
                      <button
                        onClick={() => setSelectedStudents(prev => prev.filter(id => id !== student.id))}
                        className="ml-1 hover:bg-blue-200 rounded px-1"
                      >
                        ✕
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-600 mb-2">Mensaje</p>
                <textarea
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  placeholder="Escribe el mensaje que recibirán todos los estudiantes..."
                  className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none text-sm"
                  rows={4}
                />
                <p className="text-xs text-slate-400 mt-2">
                  {notificationMessage.length} caracteres
                </p>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-600 mb-2">Link (Opcional)</p>
                <Input
                  type="url"
                  value={notificationUrl}
                  onChange={(e) => setNotificationUrl(e.target.value)}
                  placeholder="https://ejemplo.com/pagina"
                  className="text-sm"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Al hacer clic en la notificación abrirá este link
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNotificationModal(false);
                    setNotificationMessage('');
                    setNotificationUrl('');
                    setNotificationTitle('📢 Mensaje Importante');
                    setIsDailyNotification(false);
                    setNotificationHour('08');
                    setNotificationMinute('00');
                  }}
                  disabled={isSending}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSendNotifications}
                  disabled={!notificationMessage.trim() || isSending || selectedStudents.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-bold"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isDailyNotification ? 'Programando...' : 'Enviando...'}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {isDailyNotification ? 'Programar Diaria' : `Enviar a ${selectedStudents.length}`}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
