import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  decimal,
  date,
  jsonb,
  AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// 1. Tabla de Roles
export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  nombreRol: varchar('nombre_rol', { length: 50 }).notNull(),
});

// 2. Tabla de Planes
export const planes = pgTable('planes', {
  id: serial('id').primaryKey(),
  nombrePlan: varchar('nombre_plan', { length: 50 }).notNull(),
  precio: decimal('precio', { precision: 10, scale: 2 }),
});

// 2.5 Tablas de Apoyo (Cursos e Instituciones movidas aquí para romper circularidad)
export const instituciones = pgTable('instituciones', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 255 }).notNull(),
  logoUrl: text('logo_url'),
  configuracionVisual: jsonb('configuracion_visual'), // { theme: 'cyberpunk' | 'biophilic', primaryColor: string }
  fechaCreacion: timestamp('fecha_creacion').defaultNow(),
});

export const latamCompanias = pgTable('latam_companias', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 255 }).notNull(),
  descripcion: text('descripcion'),
  competencias: jsonb('competencias'), // Array de strings
  proyectos: jsonb('proyectos'), // Array de strings
  fechaCreacion: timestamp('fecha_creacion').defaultNow(),
});

export const cursos = pgTable('cursos', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 255 }).notNull(),
  institucionId: integer('institucion_id').references(() => instituciones.id),
  profesorId: integer('profesor_id').references((): AnyPgColumn => usuarios.id),
  companiaId: integer('compania_id').references(() => latamCompanias.id),
  fechaCreacion: timestamp('fecha_creacion').defaultNow(),
});

// 2.5 Tablas de Apoyo
// (Movidas arriba para evitar dependencias circulares)

// 3. Tabla de Usuarios
export const usuarios = pgTable('usuarios', {
  id: serial('id').primaryKey(),
  roleId: integer('role_id').references(() => roles.id),
  planId: integer('plan_id').references(() => planes.id),
  nombre: varchar('nombre', { length: 100 }),
  email: varchar('email', { length: 100 }).unique(),
  password: varchar('password', { length: 255 }),
  activo: boolean('activo').default(true),
  avatar: varchar('avatar', { length: 255 }).default('avatar_boy'),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  emailPadre: varchar('email_padre', { length: 100 }),
  nombrePadre: varchar('nombre_padre', { length: 100 }),
  celularPadre: varchar('celular_padre', { length: 20 }),
  trabajoPadre: varchar('trabajo_padre', { length: 100 }),
  identificacion: varchar('identificacion', { length: 20 }),
  fechaNacimiento: date('fecha_nacimiento'),
  edad: integer('edad'),
  institucion: varchar('institucion', { length: 255 }),
  curso: varchar('curso', { length: 100 }),
  ultimaConexion: timestamp('ultima_conexion'),
  institucionId: integer('institucion_id').references(() => instituciones.id),
  cursoId: integer('curso_id').references(() => cursos.id),
  geniomonedas: integer('geniomonedas').default(0),
  skinEquipadaId: integer('skin_equipada_id'),
  googleEmail: varchar('google_email', { length: 150 }),
  googleAccessToken: text('google_access_token'),
  googleRefreshToken: text('google_refresh_token'),
});

// 3.5 Tabla de Invitaciones
export const invitaciones = pgTable('invitaciones', {
  id: serial('id').primaryKey(),
  token: varchar('token', { length: 100 }).unique().notNull(),
  institucionId: integer('institucion_id').references(() => instituciones.id),
  cursoId: integer('curso_id').references(() => cursos.id),
  usada: boolean('usada').default(false),
  fechaCreacion: timestamp('fecha_creacion').defaultNow(),
});

// 4. Tabla de Módulos
export const modulos = pgTable('modulos', {
  id: serial('id').primaryKey(),
  nombreModulo: varchar('nombre_modulo', { length: 100 }),
  duracionDias: integer('duracion_dias'),
  profesorId: integer('profesor_id').references(() => usuarios.id),
  categoria: varchar('categoria', { length: 20 }).default('standard'), // 'standard'
  cursoId: integer('curso_id').references(() => cursos.id),
  bloqueado: boolean('bloqueado').default(false),
  fechaCreacion: timestamp('fecha_creacion').defaultNow(),
});

// 5. Tabla de Asignaciones
export const asignaciones = pgTable('asignaciones', {
  id: serial('id').primaryKey(),
  estudianteId: integer('estudiante_id').references(() => usuarios.id),
  profesorId: integer('profesor_id').references(() => usuarios.id),
  moduloId: integer('modulo_id').references(() => modulos.id),
  fechaAsignacion: timestamp('fecha_asignacion').defaultNow(),
});

// 6. Tabla de Niveles
export const niveles = pgTable('niveles', {
  id: serial('id').primaryKey(),
  moduloId: integer('modulo_id').references(() => modulos.id),
  tituloNivel: varchar('titulo_nivel', { length: 100 }),
  orden: integer('orden'),
  bloqueadoManual: boolean('bloqueado_manual'), // Nullable by default, no fixed default here
  bloqueado: boolean('bloqueado').default(false),
  diasParaDesbloquear: integer('dias_para_desbloquear').default(7), // Default to 1 week
  googleMeetUrl: text('google_meet_url'),
  googleCalendarUrl: text('google_calendar_url'),
  descripcion: text('descripcion'),
});

// 7. Contenidos
export const contenidos = pgTable('contenidos', {
  id: serial('id').primaryKey(),
  nivelId: integer('nivel_id').references(() => niveles.id),
  tipo: varchar('tipo', { length: 20 }), // video, pdf, link, word, slides, entregable, codigo_lab, quiz, tarea, nota
  urlRecurso: text('url_recurso'),
  orden: integer('orden').default(1),
  // Campos para ejercicios de código
  tituloEjercicio: varchar('titulo_ejercicio', { length: 255 }),
  descripcionEjercicio: text('descripcion_ejercicio'),
  codigoInicial: text('codigo_inicial'),
  codigoEsperado: text('codigo_esperado'),
  lenguaje: varchar('lenguaje', { length: 50 }), // javascript, python, etc.
});

// 8. Tabla Maestra de Puntos
export const puntosLog = pgTable('puntos_log', {
  id: serial('id').primaryKey(),
  estudianteId: integer('estudiante_id').references(() => usuarios.id),
  cantidad: integer('cantidad'),
  motivo: varchar('motivo', { length: 255 }),
  fechaObtencion: timestamp('fecha_obtencion').defaultNow(),
});

// 9. Actividades
export const actividades = pgTable('actividades', {
  id: serial('id').primaryKey(),
  nivelId: integer('nivel_id').references(() => niveles.id),
  tipo: varchar('tipo', { length: 20 }), // entregable, quiz, codigo, simulador
  titulo: varchar('titulo', { length: 100 }),
  puntosMaximos: integer('puntos_maximos'),
  fechaPlazo: timestamp('fecha_plazo'),
});

// 10. Entregas
export const entregas = pgTable('entregas', {
  id: serial('id').primaryKey(),
  actividadId: integer('actividad_id').references(() => actividades.id),
  estudianteId: integer('estudiante_id').references(() => usuarios.id),
  puntosLogId: integer('puntos_log_id').references(() => puntosLog.id),
  archivoUrl: text('archivo_url'),
  calificacionNumerica: integer('calificacion_numerica'),
  feedbackProfe: text('feedback_profe'),
});

// 11. Ranking Genios Awards
export const rankingAwards = pgTable('ranking_awards', {
  id: serial('id').primaryKey(),
  estudianteId: integer('estudiante_id').references(() => usuarios.id),
  puntosTotalesId: integer('puntos_totales_id').references(() => puntosLog.id),
  posicionActual: integer('posicion_actual'),
  ultimoRewindUrl: text('ultimo_rewind_url'),
});

// 12. Certificados
export const certificados = pgTable('certificados', {
  id: serial('id').primaryKey(),
  estudianteId: integer('estudiante_id').references(() => usuarios.id),
  moduloId: integer('modulo_id').references(() => modulos.id),
  codigoVerificacion: varchar('codigo_verificacion', { length: 100 }),
  urlPdf: text('url_pdf'),
  fechaEmision: date('fecha_emision').defaultNow(),
});

// 13. Recursos (Sistema de Archivos)
export const recursos = pgTable('recursos', {
  id: serial('id').primaryKey(),
  profesorId: integer('profesor_id').references(() => usuarios.id),
  nombre: varchar('nombre', { length: 255 }).notNull(),
  tipo: varchar('tipo', { length: 50 }), // mime type
  url: text('url').notNull(),
  peso: integer('peso'),
  carpeta: varchar('carpeta', { length: 255 }), // Path for folder organization
  fechaSubida: timestamp('fecha_subida').defaultNow(),
});

// 14. Progreso de Niveles
export const progresoNiveles = pgTable('progreso_niveles', {
  id: serial('id').primaryKey(),
  estudianteId: integer('estudiante_id').references(() => usuarios.id),
  nivelId: integer('nivel_id').references(() => niveles.id),
  porcentajeCompletado: integer('porcentaje_completado').default(0),
  completado: boolean('completado').default(false),
  fechaInicio: timestamp('fecha_inicio').defaultNow(),
  fechaCompletado: timestamp('fecha_completado'),
});

// 15. Plantillas RAG (Recuperación Autónoma Guiada)
export const plantillasRag = pgTable('plantillas_rag', {
  id: serial('id').primaryKey(),
  nivelId: integer('nivel_id').references(() => niveles.id),
  // Identificación General
  programa: varchar('programa', { length: 255 }),
  modulo: varchar('modulo', { length: 255 }),
  hitoAprendizaje: varchar('hito_aprendizaje', { length: 255 }),
  mes: varchar('mes', { length: 50 }),
  semana: varchar('semana', { length: 50 }),
  tipoRag: varchar('tipo_rag', { length: 50 }), // Técnica / Práctica / Mixta
  modalidad: varchar('modalidad', { length: 50 }), // Autónoma / Asincrónica
  duracionEstimada: varchar('duracion_estimada', { length: 50 }),

  // Propósito y Objetivos
  proposito: text('proposito'),
  objetivoAprendizaje: text('objetivo_aprendizaje'),

  // Contenido Clave (Stored as JSON: [{titulo, descripcion}])
  contenidoClave: jsonb('contenido_clave'),

  // Actividad Autónoma
  nombreActividad: varchar('nombre_actividad', { length: 255 }),
  descripcionDesafio: text('descripcion_desafio'),
  pasosGuiados: jsonb('pasos_guiados'), // JSON: [{paso, completado, requiereEntregable}]

  // Ayudas
  pistas: jsonb('pistas'), // JSON: [pista1, pista2...]

  // Evidencia
  tipoEvidencia: varchar('tipo_evidencia', { length: 100 }),
  cantidadEvidencias: integer('cantidad_evidencias'),

  // Competencias (JSON)
  competenciasTecnicas: text('competencias_tecnicas'),
  competenciasBlandas: text('competencias_blandas'),

  // Impacto
  porcentajeAporte: integer('porcentaje_aporte'),
  actualizaRadar: boolean('actualiza_radar').default(false),
  regularizaAsistencia: boolean('regulariza_asistencia').default(false),

  // Criterios de Finalización
  criterioEvidencia: boolean('criterio_evidencia').default(false),
  criterioPasos: boolean('criterio_pasos').default(false),
  criterioTiempo: boolean('criterio_tiempo').default(false),

  // Secciones Dinámicas Globales (Para expandir la plantilla)
  seccionesDinamicas: jsonb('secciones_dinamicas'), // JSON: [{ titulo, tipo: 'texto'|'checklist', contenido: string | [] }]

  imagenUrl: text('imagen_url'), // Main image for the RAG template

  fechaCreacion: timestamp('fecha_creacion').defaultNow(),
});

// 16. Plantillas HA (Hito de Aprendizaje)
export const plantillasHa = pgTable('plantillas_ha', {
  id: serial('id').primaryKey(),
  nivelId: integer('nivel_id').references(() => niveles.id),

  // 1. Fase
  fase: varchar('fase', { length: 255 }),

  // 2. Objetivo de la semana
  objetivoSemana: text('objetivo_semana'),

  // 3. Concepto Clave
  conceptoClave: text('concepto_clave'),

  // 4. Pasos Guiados (Checklist)
  pasosGuiados: jsonb('pasos_guiados'),

  // 5. Resultado Esperado
  resultadoEsperado: text('resultado_esperado'),
  // Nota: El "Estado" (Logrado/En Proceso) se guarda en el progreso del estudiante, no en la plantilla.

  // 6. Evidencia
  evidenciaTipos: jsonb('evidencia_tipos'), // JSON Array: ['Imagen', 'Video']
  evidenciaDescripcion: text('evidencia_descripcion'),

  // 7. Pregunta de Reflexión
  preguntaReflexion: text('pregunta_reflexion'),

  // Secciones Dinámicas
  seccionesDinamicas: jsonb('secciones_dinamicas'), // JSON

  fechaCreacion: timestamp('fecha_creacion').defaultNow(),
});





// 17. Logros (Achievements)
export const logros = pgTable('logros', {
  id: serial('id').primaryKey(),
  titulo: varchar('titulo', { length: 100 }),
  descripcion: text('descripcion'),
  icono: varchar('icono', { length: 50 }),
  xpRequerida: integer('xp_requerida'),
  condicionTipo: varchar('condicion_tipo', { length: 50 }), // LEVEL_REACHED, STREAK, MISSION_COMPLETE
  condicionValor: integer('condicion_valor'),
});

// 18. Logros Desbloqueados
export const logrosDesbloqueados = pgTable('logros_desbloqueados', {
  id: serial('id').primaryKey(),
  estudianteId: integer('estudiante_id').references(() => usuarios.id),
  logroId: integer('logro_id').references(() => logros.id),
  fechaDesbloqueo: timestamp('fecha_desbloqueo').defaultNow(),
});

// 19. Gamificación Estudiante (Estado Actual)
export const gamificacionEstudiante = pgTable('gamificacion_estudiante', {
  id: serial('id').primaryKey(),
  estudianteId: integer('estudiante_id').references(() => usuarios.id).unique(),
  xpTotal: integer('xp_total').default(0),
  nivelActual: integer('nivel_actual').default(1),
  puntosDisponibles: integer('puntos_disponibles').default(0), // Para tienda
  rachaDias: integer('racha_dias').default(0),
  ultimaRachaUpdate: timestamp('ultima_racha_update'),
});

// 20. Entregas RAG
export const entregasRag = pgTable('entregas_rag', {
  id: serial('id').primaryKey(),
  estudianteId: integer('estudiante_id').references(() => usuarios.id),
  plantillaRagId: integer('plantilla_rag_id').references(() => plantillasRag.id),
  pasoIndice: integer('paso_indice'), // Qué paso es (0, 1, 2...)
  archivoUrl: text('archivo_url'),
  tipoArchivo: varchar('tipo_archivo', { length: 50 }),
  calificacionNumerica: integer('calificacion_numerica'),
  feedbackProfe: text('feedback_profe'),
  feedbackAvatar: text('feedback_avatar'),
  fechaSubida: timestamp('fecha_subida').defaultNow(),
});

// 21. Entregas HA (Evidencia Hito)
export const entregasHa = pgTable('entregas_ha', {
  id: serial('id').primaryKey(),
  estudianteId: integer('estudiante_id').references(() => usuarios.id),
  plantillaHaId: integer('plantilla_ha_id').references(() => plantillasHa.id),
  archivosUrls: text('archivos_urls'), // JSON Array stringified
  comentarioEstudiante: text('comentario_estudiante'),
  calificacionNumerica: integer('calificacion_numerica'),
  feedbackProfe: text('feedback_profe'),
  validado: boolean('validado').default(false),
  fechaSubida: timestamp('fecha_subida').defaultNow(),
});

// 22. Misiones (Mission Definitions)
export const misiones = pgTable('misiones', {
  id: serial('id').primaryKey(),
  tipo: varchar('tipo', { length: 50 }), // DAILY_LOGIN, VIEW_CONTENT, COMPLETE_ACTIVITY, STREAK_3, STREAK_7
  titulo: varchar('titulo', { length: 100 }),
  descripcion: text('descripcion'),
  xpRecompensa: integer('xp_recompensa'),
  iconoUrl: varchar('icono_url', { length: 255 }),
  objetivoValor: integer('objetivo_valor'), // e.g., 3 for "view 3 contents"
  esDiaria: boolean('es_diaria').default(false),
  activa: boolean('activa').default(true),
});

// 23. Progreso de Misiones (Student Mission Progress)
export const progresoMisiones = pgTable('progreso_misiones', {
  id: serial('id').primaryKey(),
  estudianteId: integer('estudiante_id').references(() => usuarios.id),
  misionId: integer('mision_id').references(() => misiones.id),
  progresoActual: integer('progreso_actual').default(0),
  completada: boolean('completada').default(false),
  recompensaReclamada: boolean('recompensa_reclamada').default(false),
  fechaInicio: timestamp('fecha_inicio').defaultNow(),
  fechaCompletado: timestamp('fecha_completado'),
  semanaInicio: timestamp('semana_inicio'), // For weekly mission reset/sync
});


// 24. Premios (Prizes for Raffle)
export const premios = pgTable('premios', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 100 }).notNull(),
  descripcion: text('descripcion'),
  costoPuntos: integer('costo_puntos').default(0),
  imagenUrl: text('imagen_url'),
  stock: integer('stock'),
  activo: boolean('activo').default(true),
  fechaCreacion: timestamp('fecha_creacion').defaultNow(),
});

// 25. Asistencia
export const asistencia = pgTable('asistencia', {
  id: serial('id').primaryKey(),
  estudianteId: integer('estudiante_id').references(() => usuarios.id),
  nivelId: integer('nivel_id').references(() => niveles.id),
  profesorId: integer('profesor_id').references(() => usuarios.id),
  asistio: boolean('asistio').default(false),
  recuperada: boolean('recuperada').default(false),
  fecha: timestamp('fecha').defaultNow(),
});

// 26. Módulos - Profesores (Join Table for many-to-many)
export const moduloProfesores = pgTable('modulo_profesores', {
  id: serial('id').primaryKey(),
  moduloId: integer('modulo_id').references(() => modulos.id),
  profesorId: integer('profesor_id').references(() => usuarios.id),
  fechaAsignacion: timestamp('fecha_asignacion').defaultNow(),
});

// 27. Usuarios - Cursos (Join Table for many-to-many course assignment)
export const usuariosCursos = pgTable('usuarios_cursos', {
  id: serial('id').primaryKey(),
  usuarioId: integer('usuario_id').references(() => usuarios.id).notNull(),
  cursoId: integer('curso_id').references(() => cursos.id).notNull(),
  fechaAsignacion: timestamp('fecha_asignacion').defaultNow(),
});

// Schemas for insertions
export const insertRoleSchema = createInsertSchema(roles);
export const insertPlanSchema = createInsertSchema(planes);
export const insertUsuarioSchema = createInsertSchema(usuarios);
export const insertModuloSchema = createInsertSchema(modulos);
export const insertAsignacionSchema = createInsertSchema(asignaciones);
export const insertNivelSchema = createInsertSchema(niveles);
export const insertContenidoSchema = createInsertSchema(contenidos);
export const insertPuntoLogSchema = createInsertSchema(puntosLog);
export const insertActividadSchema = createInsertSchema(actividades);
export const insertEntregaSchema = createInsertSchema(entregas);
export const insertRankingAwardSchema = createInsertSchema(rankingAwards);
export const insertCertificadoSchema = createInsertSchema(certificados);
export const insertProgresoNivelSchema = createInsertSchema(progresoNiveles);

// Types
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;

export type Plan = typeof planes.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;

export type Usuario = typeof usuarios.$inferSelect;
export type InsertUsuario = z.infer<typeof insertUsuarioSchema>;

export type Modulo = typeof modulos.$inferSelect;
export type InsertModulo = z.infer<typeof insertModuloSchema>;

export type Asignacion = typeof asignaciones.$inferSelect;
export type InsertAsignacion = z.infer<typeof insertAsignacionSchema>;

export type Nivel = typeof niveles.$inferSelect;
export type InsertNivel = z.infer<typeof insertNivelSchema>;

export type Contenido = typeof contenidos.$inferSelect;
export type InsertContenido = z.infer<typeof insertContenidoSchema>;

export type PuntoLog = typeof puntosLog.$inferSelect;
export type InsertPuntoLog = z.infer<typeof insertPuntoLogSchema>;

export type Actividad = typeof actividades.$inferSelect;
export type InsertActividad = z.infer<typeof insertActividadSchema>;

export type Entrega = typeof entregas.$inferSelect;
export type InsertEntrega = z.infer<typeof insertEntregaSchema>;

export type RankingAward = typeof rankingAwards.$inferSelect;
export type InsertRankingAward = z.infer<typeof insertRankingAwardSchema>;

export type Certificado = typeof certificados.$inferSelect;
export type InsertCertificado = z.infer<typeof insertCertificadoSchema>;

export type ProgresoNivel = typeof progresoNiveles.$inferSelect;
export type InsertProgresoNivel = z.infer<typeof insertProgresoNivelSchema>;

export const insertPlantillaRagSchema = createInsertSchema(plantillasRag);
export type PlantillaRag = typeof plantillasRag.$inferSelect;
export type InsertPlantillaRag = z.infer<typeof insertPlantillaRagSchema>;

export const insertPlantillaHaSchema = createInsertSchema(plantillasHa);
export type PlantillaHa = typeof plantillasHa.$inferSelect;
export type InsertPlantillaHa = z.infer<typeof insertPlantillaHaSchema>;

export const insertLogroSchema = createInsertSchema(logros);
export const insertLogroDesbloqueadoSchema = createInsertSchema(logrosDesbloqueados);
export const insertGamificacionEstudianteSchema = createInsertSchema(gamificacionEstudiante);
export const insertEntregaRagSchema = createInsertSchema(entregasRag);
export const insertEntregaHaSchema = createInsertSchema(entregasHa);
export const insertMisionSchema = createInsertSchema(misiones);
export const insertProgresoMisionSchema = createInsertSchema(progresoMisiones);
export const insertPremioSchema = createInsertSchema(premios);
export const insertAsistenciaSchema = createInsertSchema(asistencia);
export const insertModuloProfesorSchema = createInsertSchema(moduloProfesores);
export const insertUsuarioCursoSchema = createInsertSchema(usuariosCursos);



export type Logro = typeof logros.$inferSelect;
export type InsertLogro = z.infer<typeof insertLogroSchema>;

export type LogroDesbloqueado = typeof logrosDesbloqueados.$inferSelect;
export type InsertLogroDesbloqueado = z.infer<typeof insertLogroDesbloqueadoSchema>;

export type GamificacionEstudiante = typeof gamificacionEstudiante.$inferSelect;
export type InsertGamificacionEstudiante = z.infer<typeof insertGamificacionEstudianteSchema>;

export type EntregaRag = typeof entregasRag.$inferSelect;
export type InsertEntregaRag = z.infer<typeof insertEntregaRagSchema>;

export type EntregaHa = typeof entregasHa.$inferSelect;
export type InsertEntregaHa = z.infer<typeof insertEntregaHaSchema>;

export type Mision = typeof misiones.$inferSelect;
export type InsertMision = z.infer<typeof insertMisionSchema>;

export type ProgresoMision = typeof progresoMisiones.$inferSelect;
export type InsertProgresoMision = z.infer<typeof insertProgresoMisionSchema>;

export type Premio = typeof premios.$inferSelect;
export type InsertPremio = z.infer<typeof insertPremioSchema>;

export type Asistencia = typeof asistencia.$inferSelect;
export type InsertAsistencia = z.infer<typeof insertAsistenciaSchema>;

export type ModuloProfesor = typeof moduloProfesores.$inferSelect;
export type InsertModuloProfesor = z.infer<typeof insertModuloProfesorSchema>;

export type UsuarioCurso = typeof usuariosCursos.$inferSelect;
export type InsertUsuarioCurso = z.infer<typeof insertUsuarioCursoSchema>;



// 28. Plantillas Kids
export const plantillasKids = pgTable('plantillas_kids', {
  id: serial('id').primaryKey(),
  nivelId: integer('nivel_id').references(() => niveles.id),
  
  // Basic info
  titulo: varchar('titulo', { length: 255 }),
  descripcion: text('descripcion'),
  
  // Game structure (JSON: steps for algorithms, narrated questions, etc)
  actividades: jsonb('actividades'),
  
  // Additional configuration (colors, voiceover urls, etc)
  configuracion: jsonb('configuracion'),

  // Type of activity and main video support
  tipo: varchar('tipo', { length: 50 }).default('adventure'),
  videoUrl: text('video_url'),
  bloqueado: boolean('bloqueado').default(false),
  
  fechaCreacion: timestamp('fecha_creacion').defaultNow(),
});

// 29. Entregas Kids
export const entregasKids = pgTable('entregas_kids', {
  id: serial('id').primaryKey(),
  estudianteId: integer('estudiante_id').references(() => usuarios.id),
  plantillaKidsId: integer('plantilla_kids_id').references(() => plantillasKids.id),
  resultados: jsonb('resultados'), // JSON with step results
  calificacionNumerica: integer('calificacion_numerica'),
  feedbackProfe: text('feedback_profe'),
  fechaSubida: timestamp('fecha_subida').defaultNow(),
});

// Zod schema exports
export const insertPlantillasKidsSchema = createInsertSchema(plantillasKids);
export type PlantillaKids = typeof plantillasKids.$inferSelect;
export type InsertPlantillaKids = z.infer<typeof insertPlantillasKidsSchema>;

export const insertEntregaKidsSchema = createInsertSchema(entregasKids);
export type EntregaKids = typeof entregasKids.$inferSelect;
export type InsertEntregaKids = z.infer<typeof insertEntregaKidsSchema>;

// 31. Plantillas City (Futuristic World)
export const plantillasCity = pgTable('plantillas_city', {
  id: serial('id').primaryKey(),
  nivelId: integer('nivel_id').references(() => niveles.id),
  titulo: varchar('titulo', { length: 255 }).notNull(),
  sector: varchar('sector', { length: 50 }), // 'energy', 'transport', 'water', 'communication', 'nature'
  tipoReto: varchar('tipo_reto', { length: 50 }), // 'logic_gates', 'pathfinding', 'sorting'
  configuracion: jsonb('configuracion'), // Specific challenge data
  recompensaXp: integer('recompensa_xp').default(100),
  fechaCreacion: timestamp('fecha_creacion').defaultNow(),
});

// 32. Progreso City (Sectors Repaired)
export const progresoCity = pgTable('progreso_city', {
  id: serial('id').primaryKey(),
  estudianteId: integer('estudiante_id').references(() => usuarios.id),
  sector: varchar('sector', { length: 50 }),
  reparado: boolean('reparado').default(false),
  fechaReparacion: timestamp('fecha_reparacion'),
});

// Zod schemas and types for new tables
export const insertInstitucionSchema = createInsertSchema(instituciones);
export type Institucion = typeof instituciones.$inferSelect;
export type InsertInstitucion = z.infer<typeof insertInstitucionSchema>;
 
export const insertCursoSchema = createInsertSchema(cursos);
export type Curso = typeof cursos.$inferSelect;
export type InsertCurso = z.infer<typeof insertCursoSchema>;

export const insertPlantillaCitySchema = createInsertSchema(plantillasCity);
export type PlantillaCity = typeof plantillasCity.$inferSelect;
export type InsertPlantillaCity = z.infer<typeof insertPlantillaCitySchema>;

export const insertProgresoCitySchema = createInsertSchema(progresoCity);
export type ProgresoCity = typeof progresoCity.$inferSelect;
export type InsertProgresoCity = z.infer<typeof insertProgresoCitySchema>;

export const insertLatamCompaniaSchema = createInsertSchema(latamCompanias);
export type LatamCompania = typeof latamCompanias.$inferSelect;
export type InsertLatamCompania = z.infer<typeof insertLatamCompaniaSchema>;

// 33. Skins
export const skins = pgTable('skins', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 100 }).notNull(),
  descripcion: text('descripcion'),
  precioGeniomonedas: integer('precio_geniomonedas').default(0),
  imagenUrl: text('imagen_url').notNull(),
  tipo: varchar('tipo', { length: 50 }).notNull(), // 'avatar_head', 'avatar_body', 'profile_frame'
  disponible: boolean('disponible').default(true),
  fechaCreacion: timestamp('fecha_creacion').defaultNow(),
});

// 34. Usuarios Skins (Relación many-to-many)
export const usuariosSkins = pgTable('usuarios_skins', {
  id: serial('id').primaryKey(),
  usuarioId: integer('usuario_id').references(() => usuarios.id),
  skinId: integer('skin_id').references(() => skins.id),
  fechaAdquisicion: timestamp('fecha_adquisicion').defaultNow(),
});

export const insertSkinSchema = createInsertSchema(skins);
export type Skin = typeof skins.$inferSelect;
export type InsertSkin = z.infer<typeof insertSkinSchema>;

export const insertUsuarioSkinSchema = createInsertSchema(usuariosSkins);
export type UsuarioSkin = typeof usuariosSkins.$inferSelect;
export type InsertUsuarioSkin = z.infer<typeof insertUsuarioSkinSchema>;

// ============================================================
// CURRÍCULO INSTITUCIONAL (Separado de modulos central)
// ============================================================

// 35. Secciones Institucionales (Unidades/Bloques dentro de un Curso)
export const seccionesInst = pgTable('secciones_inst', {
  id: serial('id').primaryKey(),
  cursoId: integer('curso_id').references(() => cursos.id).notNull(),
  nombre: varchar('nombre', { length: 255 }).notNull(),
  descripcion: text('descripcion'),
  orden: integer('orden').default(0),
  activo: boolean('activo').default(true),
  fechaCreacion: timestamp('fecha_creacion').defaultNow(),
});

// 36. Módulos Institucionales (Contenido dentro de secciones - NO es la tabla modulos central)
export const modulosInst = pgTable('modulos_inst', {
  id: serial('id').primaryKey(),
  seccionId: integer('seccion_id').references(() => seccionesInst.id).notNull(),
  cursoId: integer('curso_id').references(() => cursos.id).notNull(),
  profesorId: integer('profesor_id').references(() => usuarios.id),
  titulo: varchar('titulo', { length: 255 }).notNull(),
  descripcion: text('descripcion'),
  orden: integer('orden').default(0),
  tipo: varchar('tipo', { length: 50 }).default('lesson'),
  contenido: jsonb('contenido'),
  activo: boolean('activo').default(true),
  bloqueado: boolean('bloqueado').default(false),
  xpRecompensa: integer('xp_recompensa').default(0),
  fechaLimite: timestamp('fecha_limite'),
  fechaCreacion: timestamp('fecha_creacion').defaultNow(),
});

// 37. Progreso de Módulos Institucionales
export const progresoModuloInst = pgTable('progreso_modulo_inst', {
  id: serial('id').primaryKey(),
  estudianteId: integer('estudiante_id').references(() => usuarios.id).notNull(),
  moduloInstId: integer('modulo_inst_id').references(() => modulosInst.id).notNull(),
  completado: boolean('completado').default(false),
  porcentaje: integer('porcentaje').default(0),
  respuesta: jsonb('respuesta'),
  calificacion: integer('calificacion'),
  feedbackProfe: text('feedback_profe'),
  intentos: integer('intentos').default(0),
  fechaInicio: timestamp('fecha_inicio').defaultNow(),
  fechaCompletado: timestamp('fecha_completado'),
});

// Schemas & Types — Currículo Institucional
export const insertSeccionInstSchema = createInsertSchema(seccionesInst);
export type SeccionInst = typeof seccionesInst.$inferSelect;
export type InsertSeccionInst = z.infer<typeof insertSeccionInstSchema>;

export const insertModuloInstSchema = createInsertSchema(modulosInst);
export type ModuloInst = typeof modulosInst.$inferSelect;
export type InsertModuloInst = z.infer<typeof insertModuloInstSchema>;

export const insertProgresoModuloInstSchema = createInsertSchema(progresoModuloInst);
export type ProgresoModuloInst = typeof progresoModuloInst.$inferSelect;
export type InsertProgresoModuloInst = z.infer<typeof insertProgresoModuloInstSchema>;
