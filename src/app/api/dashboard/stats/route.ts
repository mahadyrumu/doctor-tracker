import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { AnalyticsService } from "@/lib/services/analytics.service";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Active session required" },
        { status: 401 }
      );
    }

    const metrics = await AnalyticsService.getDashboardMetrics();

    return NextResponse.json({
      success: true,
      data: metrics,
    });
  } catch (error: any) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("Dashboard stats route error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve analytics metrics" },
      { status: 500 }
    );
  }
}
