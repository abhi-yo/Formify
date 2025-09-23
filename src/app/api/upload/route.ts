import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { uploadFile, generateFileKey } from "@/lib/r2";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const submissionId = formData.get("submissionId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size is 25MB.`,
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: "File type not allowed",
        },
        { status: 400 }
      );
    }

    const submission = await db.submission.findUnique({
      where: { id: submissionId },
      include: { project: { include: { organization: true } } },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileKey = generateFileKey(submissionId, file.name);

    await uploadFile(fileKey, buffer, file.type);

    const attachment = await db.attachment.create({
      data: {
        submissionId,
        r2Key: fileKey,
        contentType: file.type,
        size: file.size,
      },
    });

    await db.eventLog.create({
      data: {
        projectId: submission.projectId,
        type: "attachment_uploaded",
        metaJSON: {
          submissionId,
          attachmentId: attachment.id,
          fileSize: file.size,
          contentType: file.type,
        },
      },
    });

    return NextResponse.json({
      success: true,
      attachmentId: attachment.id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: "Upload failed",
      },
      { status: 500 }
    );
  }
}
