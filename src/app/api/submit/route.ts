import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { submissionSchema } from "@/lib/validations";
import { hashIP, verifyHMAC } from "@/lib/utils";
import { logInfo, logError } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectKey, fields, honeypot, timestamp, signature } =
      submissionSchema.parse(body);

    if (honeypot && honeypot.length > 0) {
      return NextResponse.json({ error: "Spam detected" }, { status: 400 });
    }

    const timeDiff = Date.now() - timestamp;
    if (timeDiff < 2000 || timeDiff > 300000) {
      return NextResponse.json({ error: "Invalid timestamp" }, { status: 400 });
    }

    const project = await db.project.findUnique({
      where: { publicKey: projectKey },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const dataToVerify = JSON.stringify({ projectKey, fields, timestamp });
    if (!verifyHMAC(dataToVerify, signature, project.secretKey)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const clientIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const ipHash = hashIP(clientIP.split(",")[0]);
    const userAgent = request.headers.get("user-agent") || "";

    const submission = await db.submission.create({
      data: {
        projectId: project.id,
        ipHash,
        userAgent,
        fieldsJSON: fields,
        status: "received",
      },
    });

    await db.eventLog.create({
      data: {
        projectId: project.id,
        type: "SUBMISSION_RECEIVED",
        metaJSON: {
          submissionId: submission.id,
          fieldsCount: Object.keys(fields).length,
          ipHash,
        },
      },
    });

    await logInfo("Form submission received", {
      projectId: project.id,
      submissionId: submission.id,
      metadata: {
        fieldsCount: Object.keys(fields).length,
        ipHash,
        userAgent: userAgent.substring(0, 100),
      },
    });

    const { inngest } = await import("@/lib/inngest");
    await inngest.send({
      name: "submission/created",
      data: {
        submissionId: submission.id,
        projectId: project.id,
      },
    });

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    await logError("Submission processing failed", {
      metadata: {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
    });
    
    console.error("Submission error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
