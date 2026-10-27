import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { DoctorService } from "@/lib/services/doctor.service";

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
    const doctor = await DoctorService.getDoctorById(id);

    if (!doctor) {
      return NextResponse.json(
        { success: false, message: "Doctor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: doctor,
    });
  } catch (error: any) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("Get doctor by id error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve doctor details" },
      { status: 500 }
    );
  }
}

