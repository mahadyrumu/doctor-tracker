import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { User } from "@/lib/models/User";
import { POST as loginHandler } from "../login/route";
import { POST as logoutHandler } from "../logout/route";
import { GET as meHandler } from "../me/route";
import { AUTH_COOKIE_NAME, createSessionToken } from "@/lib/auth";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  process.env.JWT_SECRET = "test_jwt_secret_key_minimum_32_characters_long_for_auth";
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
});

describe("Auth API Routes", () => {
  it("POST /api/auth/login should reject invalid input", async () => {
    const req = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid-email", password: "123" }),
    });

    const res = await loginHandler(req as any);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it("POST /api/auth/login should reject non-existent user", async () => {
    const req = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "ghost@example.com", password: "Password123!" }),
    });

    const res = await loginHandler(req as any);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.message).toContain("Invalid email or password");
  });

  it("POST /api/auth/login should authenticate valid user and set session cookie", async () => {
    await User.create({
      name: "Dr. Admin",
      email: "admin@doctortracker.com",
      password: "CorrectPassword123!",
      role: "admin",
    });

    const req = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@doctortracker.com",
        password: "CorrectPassword123!",
      }),
    });

    const res = await loginHandler(req as any);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.user.email).toBe("admin@doctortracker.com");

    const cookieHeader = res.headers.get("set-cookie");
    expect(cookieHeader).toBeDefined();
    expect(cookieHeader).toContain(AUTH_COOKIE_NAME);
  });

  it("GET /api/auth/me should return 401 when no token is provided", async () => {
    const req = new Request("http://localhost:3000/api/auth/me", {
      method: "GET",
    });

    const res = await meHandler(req as any);
    expect(res.status).toBe(401);
  });

  it("GET /api/auth/me should return user profile with valid session cookie", async () => {
    const token = await createSessionToken({
      userId: "507f1f77bcf86cd799439011",
      email: "admin@doctortracker.com",
      name: "Dr. Admin",
      role: "admin",
    });

    const req = new Request("http://localhost:3000/api/auth/me", {
      method: "GET",
      headers: {
        cookie: `${AUTH_COOKIE_NAME}=${token}`,
      },
    });

    const res = await meHandler(req as any);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.user.email).toBe("admin@doctortracker.com");
  });

  it("POST /api/auth/logout should clear session cookie", async () => {
    const res = await logoutHandler();
    expect(res.status).toBe(200);

    const cookieHeader = res.headers.get("set-cookie");
    expect(cookieHeader).toBeDefined();
    expect(cookieHeader).toContain("Max-Age=0");
  });
});
