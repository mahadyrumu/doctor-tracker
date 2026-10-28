import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getMongoUri } from "../db/mongodb";

describe("MongoDB URI Resolver & Sanitizer", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.MONGODB_URI;
    delete process.env.doctor_tracker_mongodb_atlas_MONGODB_URI;
    delete process.env.MONGODB_ATLAS_URI;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("should preserve a pristine standard connection string", () => {
    process.env.MONGODB_URI =
      "mongodb+srv://user:pass@atlas-lime-chair-doctor.tqlhuzp.mongodb.net/doctor_tracker?retryWrites=true&w=majority";
    expect(getMongoUri()).toBe(
      "mongodb+srv://user:pass@atlas-lime-chair-doctor.tqlhuzp.mongodb.net/doctor_tracker?retryWrites=true&w=majority"
    );
  });

  it("should inject doctor_tracker namespace when missing on Atlas URLs", () => {
    process.env.MONGODB_URI =
      "mongodb+srv://user:pass@atlas-lime-chair-doctor.tqlhuzp.mongodb.net/?retryWrites=true&w=majority";
    expect(getMongoUri()).toBe(
      "mongodb+srv://user:pass@atlas-lime-chair-doctor.tqlhuzp.mongodb.net/doctor_tracker?retryWrites=true&w=majority"
    );
  });

  it("should sanitize accidental variable name prefix and quotes", () => {
    process.env.MONGODB_URI =
      'doctor_tracker_mongodb_atlas_MONGODB_URI="mongodb+srv://user:pass@atlas-lime-chair-doctor.tqlhuzp.mongodb.net/doctor_tracker?retryWrites=true&w=majority"';
    expect(getMongoUri()).toBe(
      "mongodb+srv://user:pass@atlas-lime-chair-doctor.tqlhuzp.mongodb.net/doctor_tracker?retryWrites=true&w=majority"
    );
  });

  it("should read doctor_tracker_mongodb_atlas_MONGODB_URI when MONGODB_URI is absent", () => {
    process.env.doctor_tracker_mongodb_atlas_MONGODB_URI =
      "mongodb+srv://vercel-user:secret@atlas-lime-chair-doctor.tqlhuzp.mongodb.net/?retryWrites=true&w=majority";
    expect(getMongoUri()).toBe(
      "mongodb+srv://vercel-user:secret@atlas-lime-chair-doctor.tqlhuzp.mongodb.net/doctor_tracker?retryWrites=true&w=majority"
    );
  });

  it("should fall back to active cloud cluster if environment is missing or completely invalid", () => {
    process.env.MONGODB_URI = "invalid_garbage_string";
    const uri = getMongoUri();
    expect(uri.startsWith("mongodb+srv://")).toBe(true);
    expect(uri).toContain("atlas-lime-chair-doctor.tqlhuzp.mongodb.net/doctor_tracker");
  });
});
