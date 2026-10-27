import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { DoctorService } from "@/lib/services/doctor.service";
import { doctorSchema } from "@/lib/validations";

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
    const specialization = searchParams.get("specialization") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const result = await DoctorService.getDoctors({
      page,
      limit,
      search,
      specialization,
      startDate,
      endDate,
    });

    return NextResponse.json({
      success: true,
      data: result.doctors,
      pagination: result.pagination,
    });
  } catch (error: any) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("Get doctors error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve doctors list" },
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
    const parseResult = doctorSchema.safeParse(body);

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

    const doctor = await DoctorService.createDoctor(parseResult.data);

    return NextResponse.json(
      {
        success: true,
        message: "Doctor created successfully",
        data: doctor,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.code === "DUPLICATE_EMAIL" || error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "A doctor with this email address already exists",
        },
        { status: 409 }
      );
    }
    console.error("Create doctor error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create doctor" },
      { status: 500 }
    );
  }
}

