import { describe, it, expect } from "vitest";
import { createSessionToken, verifySessionToken, SessionPayload } from "../auth";

describe("Authentication & JWT Helpers", () => {
  const mockPayload: SessionPayload = {
    userId: "507f1f77bcf86cd799439011",
    email: "admin@doctortracker.com",
    name: "Super Administrator",
    role: "admin",
  };

  it("should generate a valid JWT session token and verify it correctly", async () => {
    const token = await createSessionToken(mockPayload);
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);

    const decoded = await verifySessionToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(mockPayload.userId);
    expect(decoded?.email).toBe(mockPayload.email);
    expect(decoded?.role).toBe("admin");
  });

  it("should return null for an invalid or tampered token", async () => {
    const invalidToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.signature";
    const decoded = await verifySessionToken(invalidToken);
    expect(decoded).toBeNull();
  });
});

