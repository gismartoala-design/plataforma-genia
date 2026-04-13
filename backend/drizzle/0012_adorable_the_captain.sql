CREATE TABLE "latam_companias" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(255) NOT NULL,
	"especializacion" varchar(255),
	"descripcion" text,
	"competencias" jsonb,
	"proyectos" jsonb,
	"fecha_creacion" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "skins" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(100) NOT NULL,
	"descripcion" text,
	"precio_geniomonedas" integer DEFAULT 0,
	"imagen_url" text NOT NULL,
	"tipo" varchar(50) NOT NULL,
	"disponible" boolean DEFAULT true,
	"fecha_creacion" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "usuarios_skins" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" integer,
	"skin_id" integer,
	"fecha_adquisicion" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "contenidos" ADD COLUMN "orden" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "cursos" ADD COLUMN "profesor_id" integer;--> statement-breakpoint
ALTER TABLE "cursos" ADD COLUMN "compania_id" integer;--> statement-breakpoint
ALTER TABLE "modulos" ADD COLUMN "bloqueado" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "niveles" ADD COLUMN "bloqueado" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "niveles" ADD COLUMN "google_meet_url" text;--> statement-breakpoint
ALTER TABLE "niveles" ADD COLUMN "google_calendar_url" text;--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "geniomonedas" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "skin_equipada_id" integer;--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "google_email" varchar(150);--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "google_access_token" text;--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "google_refresh_token" text;--> statement-breakpoint
ALTER TABLE "usuarios_skins" ADD CONSTRAINT "usuarios_skins_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuarios_skins" ADD CONSTRAINT "usuarios_skins_skin_id_skins_id_fk" FOREIGN KEY ("skin_id") REFERENCES "public"."skins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cursos" ADD CONSTRAINT "cursos_profesor_id_usuarios_id_fk" FOREIGN KEY ("profesor_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cursos" ADD CONSTRAINT "cursos_compania_id_latam_companias_id_fk" FOREIGN KEY ("compania_id") REFERENCES "public"."latam_companias"("id") ON DELETE no action ON UPDATE no action;