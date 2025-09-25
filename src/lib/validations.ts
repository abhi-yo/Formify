import { z } from "zod";

export const submissionSchema = z.object({
  projectKey: z.string().min(1),
  fields: z.record(z.string(), z.any()),
  honeypot: z.string().optional(),
  timestamp: z.number(),
  signature: z.string(),
  proofOfWork: z
    .object({
      challenge: z.string(),
      nonce: z.string(),
      timestamp: z.number(),
    })
    .optional(),
});

export const projectSchema = z.object({
  name: z.string().min(1).max(100),
  settings: z
    .object({
      emailForwarding: z.boolean().default(true),
      allowedOrigins: z.array(z.string()).default([]),
      webhookUrl: z.string().url().optional(),
      slackWebhook: z.string().url().optional(),
    })
    .default({
      emailForwarding: false,
      allowedOrigins: [],
    }),
});

export const attachmentSchema = z.object({
  file: z.instanceof(File),
  maxSize: z.number().default(25 * 1024 * 1024), // 25MB
  allowedTypes: z
    .array(z.string())
    .default([
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "text/plain",
    ]),
});

export type SubmissionData = z.infer<typeof submissionSchema>;
export type ProjectData = z.infer<typeof projectSchema>;
export type AttachmentData = z.infer<typeof attachmentSchema>;
