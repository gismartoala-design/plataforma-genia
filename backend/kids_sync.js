const pg = require('pg');

async function syncKidsSchema() {
    const connectionString = "postgresql://neondb_owner:npg_8DLHWINgfYS3@ep-holy-scene-ad71wis8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require";
    const client = new pg.Client({ connectionString });

    try {
        await client.connect();
        console.log("Connected to database");

        // Add 'tipo' column if it doesn't exist
        const addTipoQuery = `
            ALTER TABLE plantillas_kids 
            ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT 'adventure';
        `;
        await client.query(addTipoQuery);
        console.log("Column 'tipo' checked/added");

        // Add 'video_url' column if it doesn't exist
        const addVideoUrlQuery = `
            ALTER TABLE plantillas_kids 
            ADD COLUMN IF NOT EXISTS video_url TEXT;
        `;
        await client.query(addVideoUrlQuery);
        console.log("Column 'video_url' checked/added");

        console.log("Database synchronization completed successfully");
    } catch (err) {
        console.error("Error during synchronization:", err);
    } finally {
        await client.end();
    }
}

syncKidsSchema();
