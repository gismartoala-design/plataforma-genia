
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './shared/schema';
import { eq, like, or } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function debugContent() {
    console.log('Searching for "Cierre de impacto" or "Evidencia" in modules...');
    
    // We search in the content JSON (stringified for searching)
    const modules = await db.query.modulosInst.findMany();
    
    const results = modules.filter(m => {
        const contentStr = JSON.stringify(m.contenido || '');
        return contentStr.includes('Cierre de impacto') || contentStr.includes('Evidencia');
    });

    console.log(`Found ${results.length} modules.`);

    results.forEach(m => {
        console.log(`\n--- Module [${m.id}] ${m.titulo} ---`);
        console.log(`Tipo: ${m.tipo}`);
        // console.log(`Content: ${JSON.stringify(m.contenido, null, 2).substring(0, 500)}...`);
        
        let content;
        try {
            content = typeof m.contenido === 'string' ? JSON.parse(m.contenido) : m.contenido;
        } catch(e) {
            content = m.contenido;
        }

        const data = content?.data || content?.content || content;
        const moments = data?.moments || data?.fases || [];
        
        moments.forEach((mom: any, idx: number) => {
            const title = mom.title || mom.nombre || '';
            if (title.includes('Cierre') || title.includes('Evidencia') || title.includes('Impacto')) {
                console.log(`  [Phase ${idx + 1}] Title: ${title}`);
                console.log(`  Blocks: ${JSON.stringify(mom.blocks || mom.bloques, null, 2)}`);
            }
        });
    });

    process.exit(0);
}

debugContent().catch(err => {
    console.error(err);
    process.exit(1);
});
