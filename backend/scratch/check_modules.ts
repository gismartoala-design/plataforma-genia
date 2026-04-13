import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/shared/schema';

async function main() {
  const queryClient = postgres('postgres://postgres:password@localhost:5432/edu_connect');
  const db = drizzle(queryClient, { schema });

  const mods = await db.query.modulos.findMany({
    orderBy: (modulos, { desc }) => [desc(modulos.id)],
    limit: 5,
  });

  console.log(JSON.stringify(mods, null, 2));
  
  process.exit(0);
}

main();
