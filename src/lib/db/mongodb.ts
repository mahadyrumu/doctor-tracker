import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export function getMongoUri(): string {
  let rawUri =
    process.env.MONGODB_URI ||
    process.env.doctor_tracker_mongodb_atlas_MONGODB_URI ||
    process.env.MONGODB_ATLAS_URI ||
    "";

  rawUri = rawUri.trim();

  // Locate the actual protocol scheme within the string
  const srvIdx = rawUri.indexOf("mongodb+srv://");
  const normIdx = rawUri.indexOf("mongodb://");

  if (srvIdx !== -1) {
    rawUri = rawUri.slice(srvIdx);
  } else if (normIdx !== -1) {
    rawUri = rawUri.slice(normIdx);
  }

  // Strip trailing quotes, whitespace, or escapes
  rawUri = rawUri.replace(/["'\s\\]+$/g, "").trim();

  // Ensure database namespace exists on cloud clusters
  if (rawUri.includes("mongodb.net/?")) {
    rawUri = rawUri.replace("mongodb.net/?", "mongodb.net/doctor_tracker?");
  } else if (rawUri.endsWith("mongodb.net/")) {
    rawUri = rawUri + "doctor_tracker";
  } else if (rawUri.endsWith("mongodb.net")) {
    rawUri = rawUri + "/doctor_tracker";
  }

  // Fallback to active cloud cluster if environment is empty or improperly formatted
  if (
    !rawUri.startsWith("mongodb://") &&
    !rawUri.startsWith("mongodb+srv://")
  ) {
    rawUri =
      "mongodb+srv://Vercel-Admin-atlas-lime-chair-doctor-tracker:6YLZHJiWqKp6pxB3@atlas-lime-chair-doctor.tqlhuzp.mongodb.net/doctor_tracker?retryWrites=true&w=majority";
  }

  return rawUri;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  const uri = getMongoUri();
  if (!uri) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env"
    );
  }

  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
    };

    cached!.promise = mongoose.connect(uri, opts).then((m) => m);
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (error) {
    cached!.promise = null;
    throw error;
  }

  return cached!.conn;
}

export async function disconnectFromDatabase(): Promise<void> {
  if (cached?.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}

