import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid or missing session" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.userId,
        name: session.name,
        email: session.email,
        role: session.role,
      },
    });
  } catch (error: any) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("Auth me error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
