import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { User } from "../User";
import { Doctor } from "../Doctor";
import { Patient } from "../Patient";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
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

describe("User Model (Admin)", () => {
  it("should create a user with a hashed password", async () => {
    const user = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "SecurePassword123!",
      role: "admin",
    });

    expect(user._id).toBeDefined();
    expect(user.email).toBe("admin@example.com");
    expect(user.password).not.toBe("SecurePassword123!");
    const isMatch = await user.comparePassword("SecurePassword123!");
    expect(isMatch).toBe(true);
    const isWrong = await user.comparePassword("WrongPassword");
    expect(isWrong).toBe(false);
  });

  it("should enforce unique email constraint", async () => {
    await User.create({
      name: "Admin One",
      email: "duplicate@example.com",
      password: "Password123!",
    });

    await expect(
      User.create({
        name: "Admin Two",
        email: "duplicate@example.com",
        password: "Password456!",
      })
    ).rejects.toThrow();
  });
});

describe("Doctor Model", () => {
  it("should create a doctor with all required fields", async () => {
    const doctor = await Doctor.create({
      name: "Dr. Sarah Connor",
      specialization: "Cardiology",
      hospital: "St. Jude Hospital",
      phone: "+1-555-0199",
      email: "sarah.connor@hospital.org",
    });

    expect(doctor._id).toBeDefined();
    expect(doctor.name).toBe("Dr. Sarah Connor");
    expect(doctor.specialization).toBe("Cardiology");
    expect(doctor.hospital).toBe("St. Jude Hospital");
    expect(doctor.phone).toBe("+1-555-0199");
    expect(doctor.email).toBe("sarah.connor@hospital.org");
    expect(doctor.createdAt).toBeInstanceOf(Date);
  });

  it("should enforce email uniqueness on Doctor", async () => {
    await Doctor.create({
      name: "Dr. John Doe",
      specialization: "Pediatrics",
      hospital: "General Hospital",
      phone: "+1-555-0101",
      email: "unique@hospital.org",
    });

    await expect(
      Doctor.create({
        name: "Dr. Jane Doe",
        specialization: "Neurology",
        hospital: "City Clinic",
        phone: "+1-555-0102",
        email: "unique@hospital.org",
      })
    ).rejects.toThrow();
  });

  it("should fail validation when required fields are missing", async () => {
    await expect(
      Doctor.create({
        name: "Dr. Incomplete",
      })
    ).rejects.toThrow();
  });
});

describe("Patient Model", () => {
  it("should create a patient linked to a doctor", async () => {
    const doctor = await Doctor.create({
      name: "Dr. Gregory House",
      specialization: "Diagnostic Medicine",
      hospital: "Princeton-Plainsboro",
      phone: "+1-555-0150",
      email: "house@ppth.org",
    });

    const patient = await Patient.create({
      name: "James Wilson",
      age: 42,
      gender: "Male",
      condition: "Hypertension",
      phone: "+1-555-0822",
      admissionDate: new Date("2026-02-15"),
      doctorId: doctor._id,
    });

    expect(patient._id).toBeDefined();
    expect(patient.name).toBe("James Wilson");
    expect(patient.doctorId.toString()).toBe(doctor._id.toString());
    expect(patient.condition).toBe("Hypertension");
  });

  it("should fail if doctorId is omitted", async () => {
    await expect(
      Patient.create({
        name: "Orphan Patient",
        age: 30,
        gender: "Female",
        condition: "Asthma",
        phone: "+1-555-0999",
      })
    ).rejects.toThrow();
  });
});

