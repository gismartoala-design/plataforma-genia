CREATE TABLE "cursos" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(255) NOT NULL,
	"institucion_id" integer,
	"fecha_creacion" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "modulos" ADD COLUMN "curso_id" integer;--> statement-breakpoint
ALTER TABLE "cursos" ADD CONSTRAINT "cursos_institucion_id_instituciones_id_fk" FOREIGN KEY ("institucion_id") REFERENCES "public"."instituciones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modulos" ADD CONSTRAINT "modulos_curso_id_cursos_id_fk" FOREIGN KEY ("curso_id") REFERENCES "public"."cursos"("id") ON DELETE no action ON UPDATE no action;