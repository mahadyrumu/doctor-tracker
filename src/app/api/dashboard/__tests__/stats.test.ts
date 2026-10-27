import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Doctor, Patient } from "@/lib/models";
import { GET as statsHandler } from "../stats/route";
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

describe("Dashboard Analytics API (/api/dashboard/stats)", () => {
  it("should return 401 when request is unauthenticated", async () => {
    const req = new Request("http://localhost:3000/api/dashboard/stats", {
      method: "GET",
    });

    const res = await statsHandler(req as any);
    expect(res.status).toBe(401);
  });

  it("should compute accurate aggregated metrics via single $facet pipeline", async () => {
    // Seed 2 doctors
    const doc1 = await Doctor.create({
      name: "Dr. Alice Smith",
      specialization: "Cardiology",
      hospital: "Mayo Clinic",
      phone: "+1-555-0101",
      email: "alice@mayo.org",
    });

    const doc2 = await Doctor.create({
      name: "Dr. Bob Jones",
      specialization: "Neurology",
      hospital: "Johns Hopkins",
      phone: "+1-555-0102",
      email: "bob@jhmi.edu",
    });

    // Seed 3 patients for doc1, 1 for doc2
    const date1 = new Date("2026-03-01T10:00:00Z");
    const date2 = new Date("2026-03-02T10:00:00Z");

    await Patient.create([
      {
        name: "Patient One",
        age: 45,
        gender: "Male",
        condition: "Hypertension",
        phone: "+1-555-1001",
        admissionDate: date1,
        doctorId: doc1._id,
      },
      {
        name: "Patient Two",
        age: 50,
        gender: "Female",
        condition: "Hypertension",
        phone: "+1-555-1002",
        admissionDate: date1,
        doctorId: doc1._id,
      },
      {
        name: "Patient Three",
        age: 33,
        gender: "Female",
        condition: "Migraine",
        phone: "+1-555-1003",
        admissionDate: date2,
        doctorId: doc1._id,
      },
      {
        name: "Patient Four",
        age: 62,
        gender: "Male",
        condition: "Asthma",
        phone: "+1-555-1004",
        admissionDate: date2,
        doctorId: doc2._id,
      },
    ]);

    const token = await createSessionToken({
      userId: "507f1f77bcf86cd799439011",
      email: "admin@doctortracker.com",
      name: "Super Administrator",
      role: "admin",
    });

    const req = new Request("http://localhost:3000/api/dashboard/stats", {
      method: "GET",
      headers: {
        cookie: `${AUTH_COOKIE_NAME}=${token}`,
      },
    });

    const res = await statsHandler(req as any);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);

    const { data } = json;
    expect(data.totalDoctors).toBe(2);
    expect(data.totalPatients).toBe(4);
    expect(data.avgPatientsPerDoctor).toBe(2);

    // Verify condition breakdown
    expect(data.conditionBreakdown).toBeInstanceOf(Array);
    const hypertensionItem = data.conditionBreakdown.find(
      (c: any) => c.condition === "Hypertension"
    );
    expect(hypertensionItem?.count).toBe(2);

    // Verify patients per doctor
    expect(data.patientsPerDoctor).toBeInstanceOf(Array);
    const aliceData = data.patientsPerDoctor.find(
      (d: any) => d.doctorName === "Dr. Alice Smith"
    );
    expect(aliceData?.patientCount).toBe(3);

    // Verify timeline trend
    expect(data.admissionsTrend).toBeInstanceOf(Array);
    expect(data.admissionsTrend.length).toBeGreaterThanOrEqual(1);
  });
});

