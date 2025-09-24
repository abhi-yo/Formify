import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { userId } = await auth();
    const { projectId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "24h";

    const project = await db.project.findFirst({
      where: {
        id: projectId,
        organization: {
          id: userId,
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const timeMap: Record<string, number> = {
      "1h": 3600000,
      "24h": 86400000,
      "7d": 604800000,
      "30d": 2592000000,
    };

    const timeRange = timeMap[range] || timeMap["24h"];
    const since = new Date(Date.now() - timeRange);

    const [
      totalSubmissions,
      securityViolations,
      rateLimitHits,
      honeypotTriggers,
      proofOfWorkChallenges,
    ] = await Promise.all([
      db.submission.count({
        where: {
          projectId: projectId,
          createdAt: { gte: since },
        },
      }),
      db.eventLog.count({
        where: {
          projectId: projectId,
          type: "SECURITY_VIOLATION",
          createdAt: { gte: since },
        },
      }),
      db.eventLog.count({
        where: {
          projectId: projectId,
          type: "RATE_LIMIT_HIT",
          createdAt: { gte: since },
        },
      }),
      db.eventLog.count({
        where: {
          projectId: projectId,
          type: "HONEYPOT_TRIGGERED",
          createdAt: { gte: since },
        },
      }),
      db.eventLog.count({
        where: {
          projectId: projectId,
          type: "PROOF_OF_WORK_REQUIRED",
          createdAt: { gte: since },
        },
      }),
    ]);

    const violationReasons = await db.eventLog.groupBy({
      by: ["metaJSON"],
      where: {
        projectId: projectId,
        type: "SECURITY_VIOLATION",
        createdAt: { gte: since },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    });

    const topViolationReasons = violationReasons.map((item) => ({
      reason:
        ((item.metaJSON as Record<string, unknown>)?.reason as string) ||
        "Unknown",
      count: item._count.id,
    }));

    const recentViolations = await db.eventLog.findMany({
      where: {
        projectId: projectId,
        type: {
          in: ["SECURITY_VIOLATION", "RATE_LIMIT_HIT", "HONEYPOT_TRIGGERED"],
        },
        createdAt: { gte: since },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    const blockedSubmissions =
      securityViolations + rateLimitHits + honeypotTriggers;

    const metrics = {
      totalSubmissions,
      blockedSubmissions,
      securityViolations,
      rateLimitHits,
      honeypotTriggers,
      proofOfWorkChallenges,
      topViolationReasons,
      recentViolations,
    };

    return NextResponse.json({
      success: true,
      metrics,
      timeRange: range,
    });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
