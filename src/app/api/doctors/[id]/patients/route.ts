import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { DoctorService } from "@/lib/services/doctor.service";
import { z } from "zod";

const addDoctorPatientSchema = z.object({
  name: z.string().min(2, "Patient name must be at least 2 characters").trim(),
  age: z
    .number({ message: "Age must be a valid number" })
    .min(0, "Age cannot be negative")
    .max(130, "Age exceeds valid human limits"),
  gender: z.enum(["Male", "Female", "Other"], {
    message: "Gender must be Male, Female, or Other",
  }),
  condition: z
    .string()
    .min(2, "Condition must be at least 2 characters")
    .trim(),
  phone: z
    .string()
    .min(7, "Phone number must be at least 7 digits")
    .trim(),
  admissionDate: z.string().or(z.date()).optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Active session required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || undefined;

    const result = await DoctorService.getDoctorPatients(id, {
      page,
      limit,
      search,
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
    console.error("Get doctor patients error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve doctor's patient list" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Active session required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const parseResult = addDoctorPatientSchema.safeParse(body);

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

    const patient = await DoctorService.addPatientToDoctor(id, parseResult.data);

    return NextResponse.json(
      {
        success: true,
        message: "Patient successfully added under doctor",
        data: patient,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Add patient under doctor error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to add patient under doctor" },
      { status: 500 }
    );
  }
}

