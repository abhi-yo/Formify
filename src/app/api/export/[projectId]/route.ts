import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");

    const resolvedParams = await params;
    const project = await db.project.findFirst({
      where: {
        id: resolvedParams.projectId,
        organization: {
          id: userId,
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const whereConditions: {
      projectId: string;
      createdAt?: { gte: Date; lte: Date };
      status?: string;
    } = {
      projectId: resolvedParams.projectId,
    };

    if (startDate && endDate) {
      whereConditions.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (status) {
      whereConditions.status = status;
    }

    const submissions = await db.submission.findMany({
      where: whereConditions,
      include: {
        attachments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const csvHeaders = [
      "ID",
      "Created At",
      "Status",
      "IP Hash",
      "User Agent",
      "Attachments",
      "Fields",
    ];
    const csvRows = submissions.map((submission) => {
      const fields = JSON.stringify(submission.fieldsJSON);
      const attachmentCount = submission.attachments.length;

      return [
        submission.id,
        submission.createdAt.toISOString(),
        submission.status,
        submission.ipHash,
        submission.userAgent || "",
        attachmentCount.toString(),
        fields,
      ].map((field) => `"${String(field).replace(/"/g, '""')}"`);
    });

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.join(",")),
    ].join("\n");

    await db.eventLog.create({
      data: {
        projectId: resolvedParams.projectId,
        type: "csv_exported",
        metaJSON: {
          exportedCount: submissions.length,
          userId,
          filters: { startDate, endDate, status },
        },
      },
    });

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${
          project.name
        }-submissions-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      {
        error: "Export failed",
      },
      { status: 500 }
    );
  }
}
