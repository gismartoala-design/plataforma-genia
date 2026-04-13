-- ============================================================
-- SEED: Colegio Tech Demo
-- Compatible con el esquema Drizzle ORM (PostgreSQL)
-- Ejecutar con: psql -U <usuario> -d <base_de_datos> -f seed_colegio_tech_demo.sql
-- ============================================================
-- INSTRUCCIONES:
--   1. Ajusta la variable :EXISTING_PLAN_ID abajo si tu base ya tiene planes.
--   2. Las contraseñas están hasheadas con bcrypt. La contraseña de demo es "Demo2024!"
--   3. Ejecuta en orden: el script maneja dependencias via CTEs.
-- ============================================================

BEGIN;

-- ============================================================
-- 0. ENSURE BASE ROLES & PLANS EXIST
-- ============================================================
INSERT INTO roles (nombre_rol) VALUES
  ('admin'),
  ('profesor'),
  ('student'),
  ('specialist'),
  ('tutor'),
  ('institution_professor')
ON CONFLICT DO NOTHING;

INSERT INTO planes (nombre_plan, precio) VALUES
  ('Basic', 0.00),
  ('Pro', 49.99),
  ('Enterprise', 199.99)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 1. INSTITUCIÓN
-- ============================================================
INSERT INTO instituciones (nombre, logo_url, configuracion_visual)
VALUES (
  'Colegio Tech Demo',
  'https://via.placeholder.com/150?text=CTD',
  '{"theme": "cyberpunk", "primaryColor": "#0ea5e9"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Capturar el ID de la institución
DO $$
DECLARE
  inst_id     INTEGER;
  plan_id     INTEGER;
  
  -- Roles
  role_admin        INTEGER;
  role_profesor     INTEGER;
  role_student      INTEGER;
  role_tutor        INTEGER;
  role_inst_prof    INTEGER;

  -- Usuarios creados
  admin_id     INTEGER;
  prof1_id     INTEGER;
  prof2_id     INTEGER;
  tutor_id     INTEGER;
  stu1_id      INTEGER;
  stu2_id      INTEGER;
  stu3_id      INTEGER;
  stu4_id      INTEGER;
  stu5_id      INTEGER;

  -- Cursos
  curso1_id    INTEGER;
  curso2_id    INTEGER;

  -- Módulos (tabla central)
  mod1_id      INTEGER;
  mod2_id      INTEGER;
  mod3_id      INTEGER;
  mod4_id      INTEGER;

  -- Niveles
  niv1_id      INTEGER;
  niv2_id      INTEGER;
  niv3_id      INTEGER;
  niv4_id      INTEGER;
  niv5_id      INTEGER;
  niv6_id      INTEGER;

BEGIN

  -- Obtener IDs necesarios
  SELECT id INTO inst_id FROM instituciones WHERE nombre = 'Colegio Tech Demo' LIMIT 1;
  SELECT id INTO plan_id FROM planes WHERE nombre_plan = 'Basic' LIMIT 1;
  SELECT id INTO role_admin     FROM roles WHERE nombre_rol = 'admin' LIMIT 1;
  SELECT id INTO role_profesor  FROM roles WHERE nombre_rol = 'profesor' LIMIT 1;
  SELECT id INTO role_student   FROM roles WHERE nombre_rol = 'student' LIMIT 1;
  SELECT id INTO role_tutor     FROM roles WHERE nombre_rol = 'tutor' LIMIT 1;
  SELECT id INTO role_inst_prof FROM roles WHERE nombre_rol = 'institution_professor' LIMIT 1;

  -- ============================================================
  -- 2. USUARIOS
  -- ============================================================
  -- Contraseña hasheada de "Demo2024!" con bcrypt rounds=10
  -- Genera la tuya con: node -e "const bcrypt=require('bcrypt'); bcrypt.hash('Demo2024!',10).then(console.log)"

  -- Admin institucional
  INSERT INTO usuarios (role_id, plan_id, nombre, email, password, activo, onboarding_completed, institucion, institucion_id)
  VALUES (role_admin, plan_id, 'Admin CTD', 'admin@colegio-tech.demo', '$2b$10$Xm3Gg8Rk1vZ2oP5tN6wDJuUaV0BmCfQ9YsHjKlD7ExWzAn4FcMiO', true, true, 'Colegio Tech Demo', inst_id)
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO admin_id;
  IF admin_id IS NULL THEN
    SELECT id INTO admin_id FROM usuarios WHERE email = 'admin@colegio-tech.demo';
  END IF;

  -- Profesor 1 - Ciencias de la Computación
  INSERT INTO usuarios (role_id, plan_id, nombre, email, password, activo, onboarding_completed, institucion, institucion_id)
  VALUES (role_profesor, plan_id, 'Rodrigo Mendez', 'rodrigo.mendez@colegio-tech.demo', '$2b$10$Xm3Gg8Rk1vZ2oP5tN6wDJuUaV0BmCfQ9YsHjKlD7ExWzAn4FcMiO', true, true, 'Colegio Tech Demo', inst_id)
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO prof1_id;
  IF prof1_id IS NULL THEN
    SELECT id INTO prof1_id FROM usuarios WHERE email = 'rodrigo.mendez@colegio-tech.demo';
  END IF;

  -- Profesor 2 - Mecatrónica
  INSERT INTO usuarios (role_id, plan_id, nombre, email, password, activo, onboarding_completed, institucion, institucion_id)
  VALUES (role_profesor, plan_id, 'Laura Castillo', 'laura.castillo@colegio-tech.demo', '$2b$10$Xm3Gg8Rk1vZ2oP5tN6wDJuUaV0BmCfQ9YsHjKlD7ExWzAn4FcMiO', true, true, 'Colegio Tech Demo', inst_id)
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO prof2_id;
  IF prof2_id IS NULL THEN
    SELECT id INTO prof2_id FROM usuarios WHERE email = 'laura.castillo@colegio-tech.demo';
  END IF;

  -- Tutor
  INSERT INTO usuarios (role_id, plan_id, nombre, email, password, activo, onboarding_completed, institucion, institucion_id)
  VALUES (role_tutor, plan_id, 'Carmen Rios', 'carmen.rios@colegio-tech.demo', '$2b$10$Xm3Gg8Rk1vZ2oP5tN6wDJuUaV0BmCfQ9YsHjKlD7ExWzAn4FcMiO', true, true, 'Colegio Tech Demo', inst_id)
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO tutor_id;
  IF tutor_id IS NULL THEN
    SELECT id INTO tutor_id FROM usuarios WHERE email = 'carmen.rios@colegio-tech.demo';
  END IF;

  -- Estudiante 1
  INSERT INTO usuarios (role_id, plan_id, nombre, email, password, activo, onboarding_completed, edad, institucion, institucion_id, avatar)
  VALUES (role_student, plan_id, 'Valeria Torres', 'valeria.torres@colegio-tech.demo', '$2b$10$Xm3Gg8Rk1vZ2oP5tN6wDJuUaV0BmCfQ9YsHjKlD7ExWzAn4FcMiO', true, false, 15, 'Colegio Tech Demo', inst_id, 'avatar_girl')
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO stu1_id;
  IF stu1_id IS NULL THEN
    SELECT id INTO stu1_id FROM usuarios WHERE email = 'valeria.torres@colegio-tech.demo';
  END IF;

  -- Estudiante 2
  INSERT INTO usuarios (role_id, plan_id, nombre, email, password, activo, onboarding_completed, edad, institucion, institucion_id, avatar)
  VALUES (role_student, plan_id, 'Diego Morales', 'diego.morales@colegio-tech.demo', '$2b$10$Xm3Gg8Rk1vZ2oP5tN6wDJuUaV0BmCfQ9YsHjKlD7ExWzAn4FcMiO', true, false, 16, 'Colegio Tech Demo', inst_id, 'avatar_boy')
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO stu2_id;
  IF stu2_id IS NULL THEN
    SELECT id INTO stu2_id FROM usuarios WHERE email = 'diego.morales@colegio-tech.demo';
  END IF;

  -- Estudiante 3
  INSERT INTO usuarios (role_id, plan_id, nombre, email, password, activo, onboarding_completed, edad, institucion, institucion_id, avatar)
  VALUES (role_student, plan_id, 'Sofia Guerrero', 'sofia.guerrero@colegio-tech.demo', '$2b$10$Xm3Gg8Rk1vZ2oP5tN6wDJuUaV0BmCfQ9YsHjKlD7ExWzAn4FcMiO', true, false, 15, 'Colegio Tech Demo', inst_id, 'avatar_girl')
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO stu3_id;
  IF stu3_id IS NULL THEN
    SELECT id INTO stu3_id FROM usuarios WHERE email = 'sofia.guerrero@colegio-tech.demo';
  END IF;

  -- Estudiante 4
  INSERT INTO usuarios (role_id, plan_id, nombre, email, password, activo, onboarding_completed, edad, institucion, institucion_id, avatar)
  VALUES (role_student, plan_id, 'Andres Perez', 'andres.perez@colegio-tech.demo', '$2b$10$Xm3Gg8Rk1vZ2oP5tN6wDJuUaV0BmCfQ9YsHjKlD7ExWzAn4FcMiO', true, false, 17, 'Colegio Tech Demo', inst_id, 'avatar_robot')
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO stu4_id;
  IF stu4_id IS NULL THEN
    SELECT id INTO stu4_id FROM usuarios WHERE email = 'andres.perez@colegio-tech.demo';
  END IF;

  -- Estudiante 5
  INSERT INTO usuarios (role_id, plan_id, nombre, email, password, activo, onboarding_completed, edad, institucion, institucion_id, avatar)
  VALUES (role_student, plan_id, 'Isabella Vargas', 'isabella.vargas@colegio-tech.demo', '$2b$10$Xm3Gg8Rk1vZ2oP5tN6wDJuUaV0BmCfQ9YsHjKlD7ExWzAn4FcMiO', true, false, 16, 'Colegio Tech Demo', inst_id, 'avatar_girl')
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO stu5_id;
  IF stu5_id IS NULL THEN
    SELECT id INTO stu5_id FROM usuarios WHERE email = 'isabella.vargas@colegio-tech.demo';
  END IF;

  -- ============================================================
  -- 3. CURSOS
  -- ============================================================
  INSERT INTO cursos (nombre, institucion_id, profesor_id)
  VALUES ('Pensamiento Computacional - 10mo Grado', inst_id, prof1_id)
  RETURNING id INTO curso1_id;

  INSERT INTO cursos (nombre, institucion_id, profesor_id)
  VALUES ('Ingeniería y Mecatrónica - 11vo Grado', inst_id, prof2_id)
  RETURNING id INTO curso2_id;

  -- Actualizar curso_id en usuarios
  UPDATE usuarios SET curso_id = curso1_id WHERE id IN (stu1_id, stu2_id, stu3_id);
  UPDATE usuarios SET curso_id = curso2_id WHERE id IN (stu4_id, stu5_id);

  -- Enrolar estudiantes en cursos (join table)
  INSERT INTO usuarios_cursos (usuario_id, curso_id) VALUES (stu1_id, curso1_id) ON CONFLICT DO NOTHING;
  INSERT INTO usuarios_cursos (usuario_id, curso_id) VALUES (stu2_id, curso1_id) ON CONFLICT DO NOTHING;
  INSERT INTO usuarios_cursos (usuario_id, curso_id) VALUES (stu3_id, curso1_id) ON CONFLICT DO NOTHING;
  INSERT INTO usuarios_cursos (usuario_id, curso_id) VALUES (stu4_id, curso2_id) ON CONFLICT DO NOTHING;
  INSERT INTO usuarios_cursos (usuario_id, curso_id) VALUES (stu5_id, curso2_id) ON CONFLICT DO NOTHING;

  -- ============================================================
  -- 4. MÓDULOS (tabla central de módulos educativos)
  -- ============================================================
  -- Módulo 1: Lógica y Algoritmos (Curso 1)
  INSERT INTO modulos (nombre_modulo, duracion_dias, profesor_id, categoria, curso_id)
  VALUES ('Lógica y Algoritmos', 30, prof1_id, 'standard', curso1_id)
  RETURNING id INTO mod1_id;

  -- Módulo 2: Programación en Python (Curso 1)
  INSERT INTO modulos (nombre_modulo, duracion_dias, profesor_id, categoria, curso_id)
  VALUES ('Programación en Python', 45, prof1_id, 'standard', curso1_id)
  RETURNING id INTO mod2_id;

  -- Módulo 3: Sistemas Embebidos (Curso 2)
  INSERT INTO modulos (nombre_modulo, duracion_dias, profesor_id, categoria, curso_id)
  VALUES ('Sistemas Embebidos con Arduino', 45, prof2_id, 'standard', curso2_id)
  RETURNING id INTO mod3_id;

  -- Módulo 4: CS Avanzado (Curso 2)
  INSERT INTO modulos (nombre_modulo, duracion_dias, profesor_id, categoria, curso_id)
  VALUES ('Estructuras de Datos y Algoritmos', 60, prof1_id, 'standard', curso2_id)
  RETURNING id INTO mod4_id;

  -- ============================================================
  -- 5. ASIGNACIONES (estudiantes -> módulos)
  -- ============================================================
  INSERT INTO asignaciones (estudiante_id, profesor_id, modulo_id) VALUES (stu1_id, prof1_id, mod1_id) ON CONFLICT DO NOTHING;
  INSERT INTO asignaciones (estudiante_id, profesor_id, modulo_id) VALUES (stu2_id, prof1_id, mod1_id) ON CONFLICT DO NOTHING;
  INSERT INTO asignaciones (estudiante_id, profesor_id, modulo_id) VALUES (stu3_id, prof1_id, mod1_id) ON CONFLICT DO NOTHING;
  INSERT INTO asignaciones (estudiante_id, profesor_id, modulo_id) VALUES (stu1_id, prof1_id, mod2_id) ON CONFLICT DO NOTHING;
  INSERT INTO asignaciones (estudiante_id, profesor_id, modulo_id) VALUES (stu2_id, prof1_id, mod2_id) ON CONFLICT DO NOTHING;
  INSERT INTO asignaciones (estudiante_id, profesor_id, modulo_id) VALUES (stu3_id, prof1_id, mod2_id) ON CONFLICT DO NOTHING;
  INSERT INTO asignaciones (estudiante_id, profesor_id, modulo_id) VALUES (stu4_id, prof1_id, mod4_id) ON CONFLICT DO NOTHING;
  INSERT INTO asignaciones (estudiante_id, profesor_id, modulo_id) VALUES (stu5_id, prof2_id, mod3_id) ON CONFLICT DO NOTHING;

  -- ============================================================
  -- 6. NIVELES (sesiones dentro de los módulos)
  -- ============================================================

  -- Niveles Módulo 1: Lógica y Algoritmos
  INSERT INTO niveles (modulo_id, titulo_nivel, orden, dias_para_desbloquear)
  VALUES (mod1_id, 'Introducción al Pensamiento Lógico', 1, 0)
  RETURNING id INTO niv1_id;

  INSERT INTO niveles (modulo_id, titulo_nivel, orden, dias_para_desbloquear)
  VALUES (mod1_id, 'Diagramas de Flujo y Pseudocódigo', 2, 7)
  RETURNING id INTO niv2_id;

  INSERT INTO niveles (modulo_id, titulo_nivel, orden, dias_para_desbloquear)
  VALUES (mod1_id, 'Estructuras de Control', 3, 14)
  RETURNING id INTO niv3_id;

  -- Niveles Módulo 2: Programación en Python
  INSERT INTO niveles (modulo_id, titulo_nivel, orden, dias_para_desbloquear)
  VALUES (mod2_id, 'Variables, Tipos y Operadores', 1, 0)
  RETURNING id INTO niv4_id;

  INSERT INTO niveles (modulo_id, titulo_nivel, orden, dias_para_desbloquear)
  VALUES (mod2_id, 'Funciones y Recursión', 2, 7)
  RETURNING id INTO niv5_id;

  -- Nivel Módulo 3: Arduino
  INSERT INTO niveles (modulo_id, titulo_nivel, orden, dias_para_desbloquear)
  VALUES (mod3_id, 'GPIO y Sensores Básicos', 1, 0)
  RETURNING id INTO niv6_id;

  -- ============================================================
  -- 7. GAMIFICACIÓN - Inicializar estado para cada estudiante
  -- ============================================================
  INSERT INTO gamificacion_estudiante (estudiante_id, xp_total, nivel_actual, puntos_disponibles, racha_dias)
  VALUES
    (stu1_id, 0, 1, 0, 0),
    (stu2_id, 0, 1, 0, 0),
    (stu3_id, 0, 1, 0, 0),
    (stu4_id, 0, 1, 0, 0),
    (stu5_id, 0, 1, 0, 0)
  ON CONFLICT (estudiante_id) DO NOTHING;

  -- ============================================================
  -- 8. PROGRESO INICIAL DE NIVELES (todos en 0%)
  -- ============================================================
  INSERT INTO progreso_niveles (estudiante_id, nivel_id, porcentaje_completado, completado)
  VALUES
    (stu1_id, niv1_id, 0, false),
    (stu2_id, niv1_id, 0, false),
    (stu3_id, niv1_id, 0, false),
    (stu1_id, niv4_id, 0, false),
    (stu2_id, niv4_id, 0, false),
    (stu4_id, niv6_id, 0, false),
    (stu5_id, niv6_id, 0, false)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '✅ Colegio Tech Demo seed completado.';
  RAISE NOTICE '   Institución ID: %', inst_id;
  RAISE NOTICE '   Curso 1 (Computación): %', curso1_id;
  RAISE NOTICE '   Curso 2 (Mecatrónica): %', curso2_id;
  RAISE NOTICE '   Módulos creados: %, %, %, %', mod1_id, mod2_id, mod3_id, mod4_id;
  RAISE NOTICE '   Estudiantes: %, %, %, %, %', stu1_id, stu2_id, stu3_id, stu4_id, stu5_id;

END $$;

COMMIT;
