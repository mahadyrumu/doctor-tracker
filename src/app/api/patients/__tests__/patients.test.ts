import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Doctor, Patient } from "@/lib/models";
import {
  GET as getPatientsHandler,
  POST as createPatientHandler,
} from "../route";
import {
  GET as getPatientHandler,
  PUT as updatePatientHandler,
  DELETE as deletePatientHandler,
} from "../[id]/route";
import { AUTH_COOKIE_NAME, createSessionToken } from "@/lib/auth";

let mongoServer: MongoMemoryServer;
let authCookieHeader: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  process.env.JWT_SECRET = "test_jwt_secret_key_minimum_32_characters_long_for_auth";
  await mongoose.connect(uri);

  const token = await createSessionToken({
    userId: "507f1f77bcf86cd799439011",
    email: "admin@doctortracker.com",
    name: "Super Administrator",
    role: "admin",
  });
  authCookieHeader = `${AUTH_COOKIE_NAME}=${token}`;
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

describe("Dedicated Patient Management API (/api/patients)", () => {
  it("GET /api/patients should return paginated list and support condition & date filtering", async () => {
    const doctor = await Doctor.create({
      name: "Dr. Gregory House",
      specialization: "Diagnostic Medicine",
      hospital: "Princeton Plainsboro",
      phone: "+1-555-0150",
      email: "house@ppth.org",
    });

    const date1 = new Date("2026-01-10T10:00:00Z");
    const date2 = new Date("2026-02-20T10:00:00Z");

    await Patient.create([
      {
        name: "Arthur Dent",
        age: 42,
        gender: "Male",
        condition: "Hypertension",
        phone: "+1-555-4242",
        admissionDate: date1,
        doctorId: doctor._id,
      },
      {
        name: "Ford Prefect",
        age: 38,
        gender: "Male",
        condition: "Asthma",
        phone: "+1-555-4243",
        admissionDate: date2,
        doctorId: doctor._id,
      },
      {
        name: "Trillian Astra",
        age: 32,
        gender: "Female",
        condition: "Hypertension",
        phone: "+1-555-4244",
        admissionDate: date2,
        doctorId: doctor._id,
      },
    ]);

    // 1. Test pagination
    const req = new Request("http://localhost:3000/api/patients?page=1&limit=2", {
      method: "GET",
      headers: { cookie: authCookieHeader },
    });

    const res = await getPatientsHandler(req as any);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.length).toBe(2);
    expect(json.pagination.totalDocs).toBe(3);
    expect(json.pagination.totalPages).toBe(2);

    // 2. Test condition-based filtering
    const reqCondition = new Request(
      "http://localhost:3000/api/patients?condition=Hypertension",
      {
        method: "GET",
        headers: { cookie: authCookieHeader },
      }
    );

    const resCondition = await getPatientsHandler(reqCondition as any);
    const jsonCondition = await resCondition.json();
    expect(jsonCondition.data.length).toBe(2);
    expect(
      jsonCondition.data.every((p: any) => p.condition === "Hypertension")
    ).toBe(true);

    // 3. Test date-wise filtering
    const reqDate = new Request(
      "http://localhost:3000/api/patients?startDate=2026-02-01&endDate=2026-02-28",
      {
        method: "GET",
        headers: { cookie: authCookieHeader },
      }
    );

    const resDate = await getPatientsHandler(reqDate as any);
    const jsonDate = await resDate.json();
    expect(jsonDate.data.length).toBe(2);
  });

  it("PUT /api/patients/:id should edit patient information", async () => {
    const doctor = await Doctor.create({
      name: "Dr. James Wilson",
      specialization: "Oncology",
      hospital: "Princeton Plainsboro",
      phone: "+1-555-0151",
      email: "wilson@ppth.org",
    });

    const patient = await Patient.create({
      name: "Original Name",
      age: 40,
      gender: "Male",
      condition: "Hypertension",
      phone: "+1-555-1234",
      admissionDate: new Date(),
      doctorId: doctor._id,
    });

    const patientId = patient._id.toString();

    const updateReq = new Request(
      `http://localhost:3000/api/patients/${patientId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          cookie: authCookieHeader,
        },
        body: JSON.stringify({
          name: "Updated Name",
          age: 41,
          condition: "Controlled Hypertension",
        }),
      }
    );

    const res = await updatePatientHandler(updateReq as any, {
      params: Promise.resolve({ id: patientId }),
    } as any);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.name).toBe("Updated Name");
    expect(json.data.age).toBe(41);
    expect(json.data.condition).toBe("Controlled Hypertension");
  });

  it("DELETE /api/patients/:id should delete patient record", async () => {
    const doctor = await Doctor.create({
      name: "Dr. Allison Cameron",
      specialization: "Immunology",
      hospital: "Princeton Plainsboro",
      phone: "+1-555-0152",
      email: "cameron@ppth.org",
    });

    const patient = await Patient.create({
      name: "Patient To Delete",
      age: 28,
      gender: "Female",
      condition: "Allergy",
      phone: "+1-555-9999",
      admissionDate: new Date(),
      doctorId: doctor._id,
    });

    const patientId = patient._id.toString();

    const delReq = new Request(
      `http://localhost:3000/api/patients/${patientId}`,
      {
        method: "DELETE",
        headers: { cookie: authCookieHeader },
      }
    );

    const res = await deletePatientHandler(delReq as any, {
      params: Promise.resolve({ id: patientId }),
    } as any);

    expect(res.status).toBe(200);

    const inDb = await Patient.findById(patientId);
    expect(inDb).toBeNull();
  });
});
