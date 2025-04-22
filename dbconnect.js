
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

// Validate database connection string
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is not defined");
  process.exit(1);
}

// Initialize postgres client
const sql = postgres(process.env.DATABASE_URL, {
  ssl: true, // Enable SSL for Supabase connections
  max: 10, // Maximum number of connections
  idle_timeout: 30 // Close idle connections after 30 seconds
});

// Test the connection
const dbConnect = async () => {
  try {
    // Simple query to test connection
    const result = await sql`SELECT NOW()`;
    console.log("✅ PostgreSQL Connected Successfully:", result[0].now);
    return sql;
  } catch (err) {
    console.error("❌ PostgreSQL Connection Error:", err.message);
    // Don't exit the process, let the app continue running without DB
    console.log("⚠️ Application running without database connection");
    return null;
  }
};

export { sql, dbConnect };
export default dbConnect;
