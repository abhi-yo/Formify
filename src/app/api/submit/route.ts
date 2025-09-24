import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { submissionSchema } from "@/lib/validations";
import { hashIP, verifyHMAC } from "@/lib/utils";
import { logInfo, logError, logWarn } from "@/lib/logger";
import { checkRateLimit, submitRateLimit } from "@/lib/rate-limit";
import { performSecurityChecks } from "@/lib/security";
import {
  verifyProofOfWork,
  getDifficultyForProject,
} from "@/lib/proof-of-work";

export async function POST(request: NextRequest) {
  const clientIP =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";
  const ipHash = hashIP(clientIP.split(",")[0]);

  try {
    const rateLimitResult = await checkRateLimit(ipHash, submitRateLimit);
    if (!rateLimitResult.success) {
      await logWarn("Rate limit exceeded", {
        metadata: {
          ip: ipHash.substring(0, 8),
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
        },
      });

      return NextResponse.json(
        {
          error: "Too many requests",
          retryAfter: Math.ceil(
            (rateLimitResult.reset.getTime() - Date.now()) / 1000
          ),
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (rateLimitResult.reset.getTime() - Date.now()) / 1000
            ).toString(),
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset.toISOString(),
          },
        }
      );
    }

    const body = await request.json();
    const { projectKey, fields, honeypot, timestamp, signature, proofOfWork } =
      submissionSchema.parse(body);

    if (honeypot && honeypot.length > 0) {
      await logWarn("Honeypot triggered", {
        metadata: { honeypot, ip: ipHash.substring(0, 8) },
      });
      return NextResponse.json({ error: "Spam detected" }, { status: 400 });
    }

    const timeDiff = Date.now() - timestamp;
    if (timeDiff < 2000 || timeDiff > 300000) {
      return NextResponse.json({ error: "Invalid timestamp" }, { status: 400 });
    }

    const project = await db.project.findUnique({
      where: { publicKey: projectKey },
      include: {
        _count: {
          select: { submissions: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const submissionCount = project._count.submissions;
    const requiredDifficulty = getDifficultyForProject(submissionCount);

    if (proofOfWork) {
      if (!verifyProofOfWork(proofOfWork, requiredDifficulty)) {
        await logWarn("Invalid proof of work", {
          projectId: project.id,
          metadata: {
            difficulty: requiredDifficulty,
            submissionCount,
            ip: ipHash.substring(0, 8),
          },
        });
        return NextResponse.json(
          { error: "Invalid proof of work" },
          { status: 400 }
        );
      }
    } else if (submissionCount > 50) {
      return NextResponse.json(
        {
          error: "Proof of work required",
          challenge: {
            difficulty: requiredDifficulty,
            timestamp: Date.now(),
          },
        },
        { status: 400 }
      );
    }

    const securityCheck = await performSecurityChecks(
      request,
      project.id,
      fields
    );
    if (!securityCheck.passed) {
      await db.eventLog.create({
        data: {
          projectId: project.id,
          type: "SECURITY_VIOLATION",
          metaJSON: {
            reason: securityCheck.reason,
            score: securityCheck.score,
            ...securityCheck.metadata,
          },
        },
      });

      return NextResponse.json(
        {
          error: "Submission rejected",
          reason: "Security check failed",
        },
        { status: 400 }
      );
    }

    const dataToVerify = JSON.stringify({ projectKey, fields, timestamp });
    if (!verifyHMAC(dataToVerify, signature, project.secretKey)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

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
