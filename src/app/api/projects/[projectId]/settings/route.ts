import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";

const settingsSchema = z.object({
  emailNotifications: z.object({
    enabled: z.boolean(),
    recipients: z.array(z.string().email()),
  }).optional(),
  webhooks: z.object({
    enabled: z.boolean(),
    url: z.string().url().optional(),
  }).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { userId } = await auth();
    const { projectId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const settings = settingsSchema.parse(body);

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

    const updatedProject = await db.project.update({
      where: { id: projectId },
      data: {
        settings,
      },
    });

    await db.eventLog.create({
      data: {
        projectId: project.id,
        type: "SETTINGS_UPDATED",
        metaJSON: {
          emailNotifications: settings.emailNotifications?.enabled || false,
          webhooks: settings.webhooks?.enabled || false,
        },
      },
    });

    return NextResponse.json({
      success: true,
      settings: updatedProject.settings,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid settings", details: err.issues },
        { status: 400 }
      );
    }

    console.error("Settings update error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
