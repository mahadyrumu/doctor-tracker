import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getMongoUri } from "../db/mongodb";

describe("MongoDB URI Resolver & Vercel Integration", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Clean all mongo-related test keys
    for (const key of Object.keys(process.env)) {
      if (key.includes("MONGO")) {
        delete process.env[key];
      }
    }
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("should prioritize auto-injected Vercel Storage integration variables", () => {
    process.env.doctor_tracker_mongodb_atlas_MONGODB_URI =
      "mongodb+srv://vercel-user:secret@atlas-lime-chair-doctor.tqlhuzp.mongodb.net/?retryWrites=true&w=majority";
    expect(getMongoUri()).toBe(
      "mongodb+srv://vercel-user:secret@atlas-lime-chair-doctor.tqlhuzp.mongodb.net/?retryWrites=true&w=majority"
    );
  });

  it("should read standard MONGODB_URI when Vercel storage variable is not set", () => {
    process.env.MONGODB_URI =
      "mongodb+srv://user:pass@cluster.mongodb.net/doctor_tracker?retryWrites=true&w=majority";
    expect(getMongoUri()).toBe(
      "mongodb+srv://user:pass@cluster.mongodb.net/doctor_tracker?retryWrites=true&w=majority"
    );
  });

  it("should dynamically detect any custom-prefixed Vercel MongoDB integration key", () => {
    process.env.my_custom_store_MONGODB_URI =
      "mongodb+srv://custom:pass@custom-cluster.mongodb.net/?retryWrites=true&w=majority";
    expect(getMongoUri()).toBe(
      "mongodb+srv://custom:pass@custom-cluster.mongodb.net/?retryWrites=true&w=majority"
    );
  });

  it("should sanitize accidentally pasted key assignment or surrounding quotes", () => {
    process.env.MONGODB_URI =
      'doctor_tracker_mongodb_atlas_MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority"';
    expect(getMongoUri()).toBe(
      "mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority"
    );
  });

  it("should throw an actionable error if no MongoDB environment variable is found", () => {
    expect(() => getMongoUri()).toThrow(
      "Please define the MONGODB_URI environment variable inside .env or link MongoDB Atlas via Vercel Storage."
    );
  });
});
