import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { PatientService } from "@/lib/services/patient.service";
import { updatePatientSchema } from "@/lib/validations";

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
    const patient = await PatientService.getPatientById(id);

    if (!patient) {
      return NextResponse.json(
        { success: false, message: "Patient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: patient,
    });
  } catch (error: any) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("Get patient by id error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve patient details" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const parseResult = updatePatientSchema.safeParse(body);

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

    const updated = await PatientService.updatePatient(id, parseResult.data);

    return NextResponse.json({
      success: true,
      message: "Patient updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("Update patient error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update patient" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const deleted = await PatientService.deletePatient(id);

    return NextResponse.json({
      success: true,
      message: "Patient deleted successfully",
      data: deleted,
    });
  } catch (error: any) {
    console.error("Delete patient error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete patient" },
      { status: 500 }
    );
  }
}

