// MongoDB connection singleton for Next.js
// This prevents too many connections in development with hot reloading

import { MongoClient, MongoClientOptions } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  // In development, use a global variable to preserve connection
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create new client
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

// Helper to get database
export async function getMongoDb() {
  const client = await clientPromise;
  return client.db('fragview'); // your database name
}

// Collection helpers
export async function getBrandsCollection() {
  const db = await getMongoDb();
  return db.collection('brands');
}

export async function getPerfumesCollection() {
  const db = await getMongoDb();
  return db.collection('perfumes');
}

export async function getNotesCollection() {
  const db = await getMongoDb();
  return db.collection('notes');
}