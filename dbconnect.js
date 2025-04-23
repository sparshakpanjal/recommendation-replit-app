
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Validate database connection string
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is not defined");
  process.exit(1);
}

// Initialize postgres client
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function connectDb() {
  await client.connect();
  return client;
}

// Export the connect function
export { connectDb };

// If you have an SQL query setup
const sql = (queryText) => {
  return client.query(queryText);
};

// Export the sql function
export { sql };

// Export the connectDb function as dbConnect
export const dbConnect = connectDb;
