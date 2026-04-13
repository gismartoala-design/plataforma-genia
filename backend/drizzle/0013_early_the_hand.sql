CREATE TABLE "modulos_inst" (
	"id" serial PRIMARY KEY NOT NULL,
	"seccion_id" integer NOT NULL,
	"curso_id" integer NOT NULL,
	"profesor_id" integer,
	"titulo" varchar(255) NOT NULL,
	"descripcion" text,
	"orden" integer DEFAULT 0,
	"tipo" varchar(50) DEFAULT 'lesson',
	"contenido" jsonb,
	"activo" boolean DEFAULT true,
	"bloqueado" boolean DEFAULT false,
	"xp_recompensa" integer DEFAULT 0,
	"fecha_limite" timestamp,
	"fecha_creacion" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "progreso_modulo_inst" (
	"id" serial PRIMARY KEY NOT NULL,
	"estudiante_id" integer NOT NULL,
	"modulo_inst_id" integer NOT NULL,
	"completado" boolean DEFAULT false,
	"porcentaje" integer DEFAULT 0,
	"respuesta" jsonb,
	"calificacion" integer,
	"feedback_profe" text,
	"intentos" integer DEFAULT 0,
	"fecha_inicio" timestamp DEFAULT now(),
	"fecha_completado" timestamp
);
--> statement-breakpoint
CREATE TABLE "secciones_inst" (
	"id" serial PRIMARY KEY NOT NULL,
	"curso_id" integer NOT NULL,
	"nombre" varchar(255) NOT NULL,
	"descripcion" text,
	"orden" integer DEFAULT 0,
	"fecha_creacion" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "modulos_inst" ADD CONSTRAINT "modulos_inst_seccion_id_secciones_inst_id_fk" FOREIGN KEY ("seccion_id") REFERENCES "public"."secciones_inst"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modulos_inst" ADD CONSTRAINT "modulos_inst_curso_id_cursos_id_fk" FOREIGN KEY ("curso_id") REFERENCES "public"."cursos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modulos_inst" ADD CONSTRAINT "modulos_inst_profesor_id_usuarios_id_fk" FOREIGN KEY ("profesor_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progreso_modulo_inst" ADD CONSTRAINT "progreso_modulo_inst_estudiante_id_usuarios_id_fk" FOREIGN KEY ("estudiante_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progreso_modulo_inst" ADD CONSTRAINT "progreso_modulo_inst_modulo_inst_id_modulos_inst_id_fk" FOREIGN KEY ("modulo_inst_id") REFERENCES "public"."modulos_inst"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secciones_inst" ADD CONSTRAINT "secciones_inst_curso_id_cursos_id_fk" FOREIGN KEY ("curso_id") REFERENCES "public"."cursos"("id") ON DELETE no action ON UPDATE no action;