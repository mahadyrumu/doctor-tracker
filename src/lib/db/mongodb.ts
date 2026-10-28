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
  // Collect candidate connection strings in order:
  // 1. Native Vercel Storage integration variable (auto-injected by Vercel Marketplace)
  // 2. Standard MONGODB_URI (standard / local .env)
  // 3. Fallback to any dynamically discovered *_MONGODB_URI set by Vercel integrations
  const candidates: (string | undefined)[] = [
    process.env.doctor_tracker_mongodb_atlas_MONGODB_URI,
    process.env.MONGODB_URI,
    process.env.MONGODB_ATLAS_URI,
  ];

  // Discover any custom-prefixed Vercel MongoDB integration key
  for (const key of Object.keys(process.env)) {
    if (key.endsWith("_MONGODB_URI") || key.endsWith("MONGODB_URL")) {
      candidates.push(process.env[key]);
    }
  }

  for (let candidate of candidates) {
    if (!candidate || typeof candidate !== "string") continue;
    candidate = candidate.trim();

    // Locate protocol scheme (handles accidental KEY="mongodb://..." copies)
    const srvIdx = candidate.indexOf("mongodb+srv://");
    const normIdx = candidate.indexOf("mongodb://");
    const schemeIdx = srvIdx !== -1 ? srvIdx : normIdx;

    if (schemeIdx !== -1) {
      return candidate.slice(schemeIdx).replace(/["';\s\\]+$/g, "").trim();
    }
  }

  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env or link MongoDB Atlas via Vercel Storage."
  );
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  const uri = getMongoUri();

  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      dbName: "doctor_tracker",
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

