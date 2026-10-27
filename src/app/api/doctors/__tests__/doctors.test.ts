import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Doctor, Patient } from "@/lib/models";
import { GET as getDoctorsHandler, POST as createDoctorHandler } from "../route";
import {
  GET as getDoctorPatientsHandler,
  POST as addDoctorPatientHandler,
} from "../[id]/patients/route";
import { DELETE as deleteDoctorPatientHandler } from "../[id]/patients/[patientId]/route";
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

describe("Doctor Management API", () => {
  it("POST /api/doctors should create a doctor with all 5 mandatory fields", async () => {
    const req = new Request("http://localhost:3000/api/doctors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: authCookieHeader,
      },
      body: JSON.stringify({
        name: "Dr. Evelyn Reed",
        specialization: "Cardiology",
        hospital: "Stanford Health Care",
        phone: "+1-555-0199",
        email: "evelyn.reed@stanford.org",
      }),
    });

    const res = await createDoctorHandler(req as any);
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.name).toBe("Dr. Evelyn Reed");
    expect(json.data.specialization).toBe("Cardiology");
  });

  it("POST /api/doctors should reject duplicate email", async () => {
    await Doctor.create({
      name: "Dr. Initial",
      specialization: "Neurology",
      hospital: "General Hospital",
      phone: "+1-555-0001",
      email: "duplicate@hospital.org",
    });

    const req = new Request("http://localhost:3000/api/doctors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: authCookieHeader,
      },
      body: JSON.stringify({
        name: "Dr. Second",
        specialization: "Pediatrics",
        hospital: "City Clinic",
        phone: "+1-555-0002",
        email: "duplicate@hospital.org",
      }),
    });

    const res = await createDoctorHandler(req as any);
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("GET /api/doctors should return paginated list and support filtering", async () => {
    await Doctor.create([
      {
        name: "Dr. Gregory House",
        specialization: "Diagnostic",
        hospital: "Princeton Plainsboro",
        phone: "+1-555-0101",
        email: "house@ppth.org",
      },
      {
        name: "Dr. James Wilson",
        specialization: "Oncology",
        hospital: "Princeton Plainsboro",
        phone: "+1-555-0102",
        email: "wilson@ppth.org",
      },
      {
        name: "Dr. Lisa Cuddy",
        specialization: "Endocrinology",
        hospital: "Princeton Plainsboro",
        phone: "+1-555-0103",
        email: "cuddy@ppth.org",
      },
    ]);

    // Test list all with pagination
    const req = new Request("http://localhost:3000/api/doctors?page=1&limit=2", {
      method: "GET",
      headers: { cookie: authCookieHeader },
    });

    const res = await getDoctorsHandler(req as any);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.length).toBe(2);
    expect(json.pagination.totalDocs).toBe(3);
    expect(json.pagination.totalPages).toBe(2);
    expect(json.pagination.hasNextPage).toBe(true);

    // Test filter by specialization
    const reqFiltered = new Request(
      "http://localhost:3000/api/doctors?specialization=Oncology",
      {
        method: "GET",
        headers: { cookie: authCookieHeader },
      }
    );

    const resFiltered = await getDoctorsHandler(reqFiltered as any);
    const jsonFiltered = await resFiltered.json();
    expect(jsonFiltered.data.length).toBe(1);
    expect(jsonFiltered.data[0].name).toBe("Dr. James Wilson");
  });

  it("should manage corresponding patients under a specific doctor", async () => {
    const doctor = await Doctor.create({
      name: "Dr. Meredith Grey",
      specialization: "General Surgery",
      hospital: "Grey Sloan Memorial",
      phone: "+1-555-0200",
      email: "grey@greysloan.org",
    });

    const docId = doctor._id.toString();

    // 1. Add patient under this doctor
    const addPatientReq = new Request(
      `http://localhost:3000/api/doctors/${docId}/patients`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: authCookieHeader,
        },
        body: JSON.stringify({
          name: "Katie Bryce",
          age: 18,
          gender: "Female",
          condition: "Aneurysm",
          phone: "+1-555-8888",
          admissionDate: new Date(),
        }),
      }
    );

    const addRes = await addDoctorPatientHandler(addPatientReq as any, {
      params: Promise.resolve({ id: docId }),
    } as any);
    expect(addRes.status).toBe(201);
    const addJson = await addRes.json();
    expect(addJson.success).toBe(true);
    expect(addJson.data.name).toBe("Katie Bryce");
    const patientId = addJson.data._id;

    // 2. View corresponding patients for this doctor
    const getPatientsReq = new Request(
      `http://localhost:3000/api/doctors/${docId}/patients`,
      {
        method: "GET",
        headers: { cookie: authCookieHeader },
      }
    );

    const getRes = await getDoctorPatientsHandler(getPatientsReq as any, {
      params: Promise.resolve({ id: docId }),
    } as any);
    expect(getRes.status).toBe(200);
    const getJson = await getRes.json();
    expect(getJson.data.length).toBe(1);
    expect(getJson.data[0].name).toBe("Katie Bryce");

    // 3. Delete patient from doctor's list
    const deletePatientReq = new Request(
      `http://localhost:3000/api/doctors/${docId}/patients/${patientId}`,
      {
        method: "DELETE",
        headers: { cookie: authCookieHeader },
      }
    );

    const delRes = await deleteDoctorPatientHandler(deletePatientReq as any, {
      params: Promise.resolve({ id: docId, patientId }),
    } as any);
    expect(delRes.status).toBe(200);

    // Verify deletion in database
    const patientAfterDel = await Patient.findById(patientId);
    expect(patientAfterDel).toBeNull();
  });
});
