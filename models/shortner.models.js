import { connectDB } from '../config/db-client.js';

// We don't get the collection at the top level. 
// We get it inside the functions to ensure the DB is connected first.

export const loadLinks = async () => {
  try {
    const db = await connectDB(); // Await the connection
    const collection = db.collection('shorteners');
    return await collection.find().toArray();
  } catch (err) {
    console.error("Error loading links:", err);
    throw err;
  }
};

export const saveLinks = async (link) => {
  try {
    const db = await connectDB(); // Await the connection
    const collection = db.collection('shorteners');
    return await collection.insertOne(link);
  } catch (err) {
    console.error("Error saving link:", err);
    throw err;
  }
};

// IMPORTANT: You must pass 'shortCode' as an argument
export const getLinkByShortCode = async (shortCode) => {
  try {
    const db = await connectDB(); // Await the connection
    const collection = db.collection('shorteners');
    return await collection.findOne({ shortCode });
  } catch (err) {
    console.error("Error fetching link:", err);
    throw err;
  }
};