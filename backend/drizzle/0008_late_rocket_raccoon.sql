CREATE TABLE "entregas_bd" (
	"id" serial PRIMARY KEY NOT NULL,
	"estudiante_id" integer,
	"plantilla_bd_id" integer,
	"archivo_url" text,
	"comentario_estudiante" text,
	"respuestas" jsonb,
	"fecha_subida" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "entregas_it" (
	"id" serial PRIMARY KEY NOT NULL,
	"estudiante_id" integer,
	"plantilla_it_id" integer,
	"archivo_url" text,
	"comentario_estudiante" text,
	"respuestas" jsonb,
	"fecha_subida" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "entregas_kids" (
	"id" serial PRIMARY KEY NOT NULL,
	"estudiante_id" integer,
	"plantilla_kids_id" integer,
	"resultados" jsonb,
	"calificacion_numerica" integer,
	"feedback_profe" text,
	"fecha_subida" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "entregas_pic" (
	"id" serial PRIMARY KEY NOT NULL,
	"estudiante_id" integer,
	"plantilla_pic_id" integer,
	"archivo_url" text,
	"comentario_estudiante" text,
	"respuestas" jsonb,
	"fecha_subida" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "entregas_pim" (
	"id" serial PRIMARY KEY NOT NULL,
	"estudiante_id" integer,
	"plantilla_pim_id" integer,
	"archivo_url" text,
	"comentario_estudiante" text,
	"fecha_subida" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "instituciones" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(255) NOT NULL,
	"logo_url" text,
	"configuracion_visual" jsonb,
	"fecha_creacion" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "plantillas_city" (
	"id" serial PRIMARY KEY NOT NULL,
	"nivel_id" integer,
	"titulo" varchar(255) NOT NULL,
	"sector" varchar(50),
	"tipo_reto" varchar(50),
	"configuracion" jsonb,
	"recompensa_xp" integer DEFAULT 100,
	"fecha_creacion" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "plantillas_kids" (
	"id" serial PRIMARY KEY NOT NULL,
	"nivel_id" integer,
	"titulo" varchar(255),
	"descripcion" text,
	"actividades" jsonb,
	"configuracion" jsonb,
	"tipo" varchar(50) DEFAULT 'adventure',
	"video_url" text,
	"fecha_creacion" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "progreso_city" (
	"id" serial PRIMARY KEY NOT NULL,
	"estudiante_id" integer,
	"sector" varchar(50),
	"reparado" boolean DEFAULT false,
	"fecha_reparacion" timestamp
);
--> statement-breakpoint
ALTER TABLE "entregas_ha" ADD COLUMN "calificacion_numerica" integer;--> statement-breakpoint
ALTER TABLE "entregas_ha" ADD COLUMN "feedback_profe" text;--> statement-breakpoint
ALTER TABLE "entregas_rag" ADD COLUMN "calificacion_numerica" integer;--> statement-breakpoint
ALTER TABLE "entregas_rag" ADD COLUMN "feedback_profe" text;--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "ultima_conexion" timestamp;--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "institucion_id" integer;--> statement-breakpoint
ALTER TABLE "entregas_bd" ADD CONSTRAINT "entregas_bd_estudiante_id_usuarios_id_fk" FOREIGN KEY ("estudiante_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entregas_bd" ADD CONSTRAINT "entregas_bd_plantilla_bd_id_plantillas_bd_id_fk" FOREIGN KEY ("plantilla_bd_id") REFERENCES "public"."plantillas_bd"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entregas_it" ADD CONSTRAINT "entregas_it_estudiante_id_usuarios_id_fk" FOREIGN KEY ("estudiante_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entregas_it" ADD CONSTRAINT "entregas_it_plantilla_it_id_plantillas_it_id_fk" FOREIGN KEY ("plantilla_it_id") REFERENCES "public"."plantillas_it"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entregas_kids" ADD CONSTRAINT "entregas_kids_estudiante_id_usuarios_id_fk" FOREIGN KEY ("estudiante_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entregas_kids" ADD CONSTRAINT "entregas_kids_plantilla_kids_id_plantillas_kids_id_fk" FOREIGN KEY ("plantilla_kids_id") REFERENCES "public"."plantillas_kids"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entregas_pic" ADD CONSTRAINT "entregas_pic_estudiante_id_usuarios_id_fk" FOREIGN KEY ("estudiante_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entregas_pic" ADD CONSTRAINT "entregas_pic_plantilla_pic_id_plantillas_pic_id_fk" FOREIGN KEY ("plantilla_pic_id") REFERENCES "public"."plantillas_pic"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entregas_pim" ADD CONSTRAINT "entregas_pim_estudiante_id_usuarios_id_fk" FOREIGN KEY ("estudiante_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entregas_pim" ADD CONSTRAINT "entregas_pim_plantilla_pim_id_plantillas_pim_id_fk" FOREIGN KEY ("plantilla_pim_id") REFERENCES "public"."plantillas_pim"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plantillas_city" ADD CONSTRAINT "plantillas_city_nivel_id_niveles_id_fk" FOREIGN KEY ("nivel_id") REFERENCES "public"."niveles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plantillas_kids" ADD CONSTRAINT "plantillas_kids_nivel_id_niveles_id_fk" FOREIGN KEY ("nivel_id") REFERENCES "public"."niveles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progreso_city" ADD CONSTRAINT "progreso_city_estudiante_id_usuarios_id_fk" FOREIGN KEY ("estudiante_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_institucion_id_instituciones_id_fk" FOREIGN KEY ("institucion_id") REFERENCES "public"."instituciones"("id") ON DELETE no action ON UPDATE no action;