import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getSignedDownloadUrl } from "@/lib/r2";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attachmentId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const attachment = await db.attachment.findUnique({
      where: { id: resolvedParams.attachmentId },
      include: {
        submission: {
          include: {
            project: {
              include: {
                organization: true,
              },
            },
          },
        },
      },
    });

    if (!attachment) {
      return NextResponse.json(
        { error: "Attachment not found" },
        { status: 404 }
      );
    }

    const downloadUrl = await getSignedDownloadUrl(attachment.r2Key);

    await db.eventLog.create({
      data: {
        projectId: attachment.submission.projectId,
        type: "attachment_downloaded",
        metaJSON: {
          attachmentId: resolvedParams.attachmentId,
          userId,
        },
      },
    });

    return NextResponse.redirect(downloadUrl);
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      {
        error: "Download failed",
      },
      { status: 500 }
    );
  }
}
