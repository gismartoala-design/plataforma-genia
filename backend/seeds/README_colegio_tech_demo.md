# 🌱 Seed: Colegio Tech Demo

Script de migración para insertar la institución **Colegio Tech Demo** con toda su estructura en cualquier base de datos PostgreSQL que use este mismo esquema.

## Archivos generados

| Archivo | Descripción |
|---|---|
| `seed_colegio_tech_demo.sql` | Script SQL puro ejecutable con `psql` |
| `run_seed_colegio_tech.js` | Runner JS que genera el hash real de bcrypt y ejecuta el SQL |

---

## Opción A — Ejecutar con el runner JS (recomendado)

El runner genera el hash **real** de bcrypt en tiempo de ejecución y lo inyecta en el SQL antes de ejecutar.

```bash
# Desde la raíz del proyecto backend
cd backend
node seeds/run_seed_colegio_tech.js
```

Si tu `DATABASE_URL` no está en el `.env`, pásala directamente:

```bash
DATABASE_URL=postgres://postgres:tu_password@localhost:5432/edu_connect node seeds/run_seed_colegio_tech.js
```

---

## Opción B — Ejecutar directamente con psql

> ⚠️ El hash de contraseña en el `.sql` es un placeholder. Si lo ejecutas directamente con `psql`, debes reemplazar el hash primero.

**Paso 1 — Generar hash real:**
```bash
node -e "const bcrypt=require('bcrypt'); bcrypt.hash('Demo2024!',10).then(h => console.log(h))"
```

**Paso 2 — Ejecutar SQL:**
```bash
psql -U postgres -d edu_connect -f backend/seeds/seed_colegio_tech_demo.sql
```

---

## Estructura insertada

```
🏫 Colegio Tech Demo
│
├── 📘 Curso: Pensamiento Computacional - 10mo Grado
│   │   Profesor: Rodrigo Mendez
│   │
│   ├── 📦 Módulo: Lógica y Algoritmos (standard)
│   │   ├── Nivel 1: Introducción al Pensamiento Lógico
│   │   ├── Nivel 2: Diagramas de Flujo y Pseudocódigo
│   │   └── Nivel 3: Estructuras de Control
│   │
│   └── 📦 Módulo: Programación en Python (standard)
│       ├── Nivel 1: Variables, Tipos y Operadores
│       └── Nivel 2: Funciones y Recursión
│
└── 📗 Curso: Ingeniería y Mecatrónica - 11vo Grado
    │   Profesora: Laura Castillo
    │
    ├── 📦 Módulo: Sistemas Embebidos con Arduino (specialization: mechatronics)
    │   └── Nivel 1: GPIO y Sensores Básicos
    │
    └── 📦 Módulo: Estructuras de Datos y Algoritmos (specialization: cs)
```

---

## Credenciales de acceso

Contraseña de todos los usuarios demo: **`Demo2024!`**

| Rol | Email |
|---|---|
| Admin | `admin@colegio-tech.demo` |
| Profesor (CS) | `rodrigo.mendez@colegio-tech.demo` |
| Profesora (Mecatrónica) | `laura.castillo@colegio-tech.demo` |
| Tutora | `carmen.rios@colegio-tech.demo` |
| Estudiante | `valeria.torres@colegio-tech.demo` |
| Estudiante | `diego.morales@colegio-tech.demo` |
| Estudiante | `sofia.guerrero@colegio-tech.demo` |
| Especialista (CS) | `andres.perez@colegio-tech.demo` |
| Especialista (Meca) | `isabella.vargas@colegio-tech.demo` |

---

## Notas de migración

- El script usa `ON CONFLICT DO NOTHING` en todas las inserciones para que sea **idempotente** (se puede ejecutar múltiples veces).
- Los IDs son gestionados por `SERIAL` de PostgreSQL — no se fijan manualmente, se obtienen con `RETURNING id`.
- El script inicializa automáticamente `gamificacion_estudiante` y `progreso_niveles` para cada estudiante.
- Para migrar a otro sistema con la misma estructura, simplemente apunta `DATABASE_URL` al nuevo servidor.
