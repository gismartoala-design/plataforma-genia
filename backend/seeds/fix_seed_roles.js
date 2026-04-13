/**
 * fix_seed_roles.js
 * Asigna los roles correctos a los usuarios del Colegio Tech Demo
 * que quedaron con role_id = NULL tras el seed inicial.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Client } = require('pg');

async function fixRoles() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');

    // 1. Ver los roles existentes
    const roles = await client.query('SELECT id, nombre_rol FROM roles ORDER BY id');
    console.log('\n--- Roles en la Base de datos ---');
    console.table(roles.rows);

    // Buscar IDs de roles por nombre
    const findRole = (name) => {
      const r = roles.rows.find(r => r.nombre_rol === name);
      return r ? r.id : null;
    };

    const roleAdmin    = findRole('admin');
    const roleProfesor = findRole('profesor');
    const roleStudent  = findRole('student');
    const roleTutor    = findRole('tutor');

    console.log(`\nRoles detectados: admin=${roleAdmin}, profesor=${roleProfesor}, student=${roleStudent}, tutor=${roleTutor}`);

    if (!roleAdmin || !roleProfesor || !roleStudent || !roleTutor) {
      console.error('❌ No se encontraron todos los roles necesarios. Verifica la tabla `roles`');
      return;
    }

    // 2. Asignar roles a los usuarios del colegio
    const updates = [
      { email: 'admin@colegio-tech.demo',           roleId: roleAdmin    },
      { email: 'rodrigo.mendez@colegio-tech.demo',  roleId: roleProfesor },
      { email: 'laura.castillo@colegio-tech.demo',  roleId: roleProfesor },
      { email: 'carmen.rios@colegio-tech.demo',     roleId: roleTutor    },
      { email: 'valeria.torres@colegio-tech.demo',  roleId: roleStudent  },
      { email: 'diego.morales@colegio-tech.demo',   roleId: roleStudent  },
      { email: 'sofia.guerrero@colegio-tech.demo',  roleId: roleStudent  },
      { email: 'andres.perez@colegio-tech.demo',    roleId: roleStudent  },
      { email: 'isabella.vargas@colegio-tech.demo', roleId: roleStudent  },
    ];

    let updatedCount = 0;
    for (const u of updates) {
      const res = await client.query(
        'UPDATE usuarios SET role_id = $1 WHERE email = $2 RETURNING id, email, role_id',
        [u.roleId, u.email]
      );
      if (res.rows.length > 0) {
        updatedCount++;
        console.log(`✅ ${u.email} → role_id=${u.roleId}`);
      } else {
        console.warn(`⚠️  No encontrado: ${u.email}`);
      }
    }

    console.log(`\n✅ Actualizados: ${updatedCount} usuarios.`);

    // 3. Verificación final
    const verify = await client.query(
      "SELECT email, role_id, curso_id FROM usuarios WHERE email LIKE '%@colegio-tech.demo'"
    );
    console.log('\n--- Verificación Final ---');
    console.table(verify.rows);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}

fixRoles();
