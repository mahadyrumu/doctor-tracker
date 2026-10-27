import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { PatientService } from "@/lib/services/patient.service";
import { patientSchema } from "@/lib/validations";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Active session required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || undefined;
    const condition = searchParams.get("condition") || undefined;
    const doctorId = searchParams.get("doctorId") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const result = await PatientService.getPatients({
      page,
      limit,
      search,
      condition,
      doctorId,
      startDate,
      endDate,
    });

    return NextResponse.json({
      success: true,
      data: result.patients,
      pagination: result.pagination,
    });
  } catch (error: any) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("Get patients error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve patients list" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Active session required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parseResult = patientSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const patient = await PatientService.createPatient(parseResult.data);

    return NextResponse.json(
      {
        success: true,
        message: "Patient registered successfully",
        data: patient,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create patient error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create patient" },
      { status: 500 }
    );
  }
}

