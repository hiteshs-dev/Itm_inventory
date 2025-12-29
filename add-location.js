import { neon } from '@neondatabase/serverless';
const sql = neon("postgresql://neondb_owner:npg_2jdoUMF0aipg@ep-rapid-leaf-aeo9gg8s.c-2.us-east-2.aws.neondb/neondb?sslmode=require");

async function addLocationColumn() {
    console.log("🔧 Adding Location Column...");
    try {
        await sql.unsafe(`ALTER TABLE inventory ADD COLUMN IF NOT EXISTS location TEXT;`);
        console.log("✅ Location column added successfully!");
    } catch (err) { console.log("⚠️ Error:", err.message); }
    process.exit();
}
addLocationColumn();