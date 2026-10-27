import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { DoctorService } from "@/lib/services/doctor.service";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; patientId: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Active session required" },
        { status: 401 }
      );
    }

    const { id, patientId } = await params;
    const deleted = await DoctorService.removePatientFromDoctor(id, patientId);

    return NextResponse.json({
      success: true,
      message: "Patient removed from doctor's roster successfully",
      data: deleted,
    });
  } catch (error: any) {
    console.error("Delete patient from doctor error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete patient from doctor" },
      { status: 500 }
    );
  }
}
