import { MongoClient } from 'mongodb'
import { env } from './env.js' // Ensure this path is correct

// Validate that the URL exists before creating the client
if (!env.MONGODB_URL) {
  throw new Error('MONGODB_URL is missing from environment variables');
}

const client = new MongoClient(env.MONGODB_URL);
const dbName = env.MONGODB_DATABASE_NAME || "Data"; // Fallback to "Data" if env var missing

let db;

export async function connectDB() {
  try {
    if (db) return db; // Return existing connection if already connected

    await client.connect();
    db = client.db(dbName);
    console.log(`Connected to database: ${dbName}`);
    return db;
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
}

// Optional: Export the collection directly if you prefer, but getting the DB first is safer
export async function getUserCollection() {
  const database = await connectDB();
  return database.collection('user');
}