const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function check() {
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'usuarios' ORDER BY column_name");
    console.log('COLUMNS_USUARIOS_JSON:' + JSON.stringify(res.rows.map(r => r.column_name)));
    
    const resCursos = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'cursos' ORDER BY column_name");
    console.log('COLUMNS_CURSOS_JSON:' + JSON.stringify(resCursos.rows.map(r => r.column_name)));

    const resLatam = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%latam%'");
    console.log('LATAM_TABLES_JSON:' + JSON.stringify(resLatam.rows.map(r => r.table_name)));

    const res2 = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
    console.log('TABLES_PUBLIC_JSON:' + JSON.stringify(res2.rows.map(r => r.table_name)));
    
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

check();
