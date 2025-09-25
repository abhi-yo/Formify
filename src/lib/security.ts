import { NextRequest } from "next/server";
import { db } from "./db";
import { logWarn } from "./logger";

export interface SecurityCheck {
  passed: boolean;
  reason?: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export async function performSecurityChecks(
  request: NextRequest,
  projectId: string,
  fields: Record<string, unknown>
): Promise<SecurityCheck> {
  let score = 0;
  const checks: string[] = [];
  const metadata: Record<string, unknown> = {};

  const userAgent = request.headers.get("user-agent") || "";
  const referer = request.headers.get("referer");
  const origin = request.headers.get("origin");

  if (!userAgent || userAgent.length < 10) {
    score += 30;
    checks.push("suspicious_user_agent");
  }

  if (
    userAgent.toLowerCase().includes("bot") ||
    userAgent.toLowerCase().includes("crawler") ||
    userAgent.toLowerCase().includes("spider")
  ) {
    score += 25;
    checks.push("bot_user_agent");
  }

  if (!referer && !origin) {
    score += 20;
    checks.push("missing_referer_origin");
  }

  const fieldCount = Object.keys(fields).length;
  if (fieldCount === 0) {
    score += 40;
    checks.push("empty_submission");
  } else if (fieldCount > 50) {
    score += 25;
    checks.push("too_many_fields");
  }

  const totalTextLength = Object.values(fields)
    .filter((v) => typeof v === "string")
    .join("").length;

  if (totalTextLength > 10000) {
    score += 20;
    checks.push("excessive_text_length");
  }

  const suspiciousPatterns = [
    /https?:\/\/[^\s]+/gi,
    /\b(?:viagra|casino|poker|loan|bitcoin|crypto)\b/gi,
    /[^\w\s]{10,}/g,
  ];

  const allText = Object.values(fields).join(" ").toLowerCase();
  for (const pattern of suspiciousPatterns) {
    const matches = allText.match(pattern);
    if (matches && matches.length > 2) {
      score += 15;
      checks.push("suspicious_content");
      break;
    }
  }

  const clientIP =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  const recentSubmissions = await db.submission.count({
    where: {
      projectId,
       ipHash: await import("crypto").then(crypto => 
         crypto.createHash("sha256")
         .update(clientIP)
         .digest("hex")
       ),
      createdAt: {
        gte: new Date(Date.now() - 3600000),
      },
    },
  });

  if (recentSubmissions > 5) {
    score += 35;
    checks.push("high_frequency_ip");
  }

  metadata.userAgent = userAgent.substring(0, 100);
  metadata.referer = referer?.substring(0, 100);
  metadata.origin = origin?.substring(0, 100);
  metadata.fieldCount = fieldCount;
  metadata.textLength = totalTextLength;
  metadata.recentSubmissions = recentSubmissions;
  metadata.checks = checks;

  const passed = score < 50;

  if (!passed) {
    await logWarn("Suspicious submission detected", {
      projectId,
      metadata: {
        securityScore: score,
        failedChecks: checks,
        ...metadata,
      },
    });
  }

  return {
    passed,
    reason: checks.length > 0 ? checks.join(", ") : undefined,
    score,
    metadata,
  };
}

export function generateHoneypotFields(): Record<string, string> {
  const fields = [
    "email_address",
    "website_url",
    "company_name",
    "phone_number",
    "full_name",
  ];

  const honeypots: Record<string, string> = {};
  for (let i = 0; i < 2; i++) {
    const field = fields[Math.floor(Math.random() * fields.length)];
    honeypots[field] = "";
  }

  return honeypots;
}

export function detectHoneypotViolation(
  submittedFields: Record<string, unknown>,
  expectedHoneypots: string[]
): boolean {
  for (const field of expectedHoneypots) {
    const value = submittedFields[field];
    if (value && typeof value === "string" && value.trim().length > 0) {
      return true;
    }
  }
  return false;
}

