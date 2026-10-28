import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "Doctor Tracker REST API",
    version: "1.0.0",
    status: "healthy",
    description: "Production REST API for Doctor Tracker clinical management system",
    documentation: "https://github.com/mahadyrumu/doctor-tracker#readme",
    endpoints: {
      analytics: "/api/dashboard/stats",
      doctors: {
        listAndCreate: "/api/doctors",
        detailAndUpdate: "/api/doctors/:id",
        assignedPatients: "/api/doctors/:id/patients",
      },
      patients: {
        listAndCreate: "/api/patients",
        detailAndUpdate: "/api/patients/:id",
      },
      auth: {
        login: "/api/auth/login",
        logout: "/api/auth/logout",
        me: "/api/auth/me",
      },
      seed: "/api/seed",
    },
  });
}
