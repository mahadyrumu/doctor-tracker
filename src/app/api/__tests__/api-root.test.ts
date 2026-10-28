import { describe, it, expect } from "vitest";
import { GET } from "../route";

describe("Root API Route (/api)", () => {
  it("should return healthy status and index of available endpoints", async () => {
    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe("healthy");
    expect(data.endpoints).toBeDefined();
    expect(data.endpoints.doctors).toBeDefined();
    expect(data.endpoints.patients).toBeDefined();
    expect(data.endpoints.analytics).toBe("/api/dashboard/stats");
  });
});
