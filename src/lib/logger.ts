import { Logtail } from "@logtail/node";

let logger: Logtail | null = null;

if (process.env.LOGTAIL_TOKEN) {
  logger = new Logtail(process.env.LOGTAIL_TOKEN);
}

export interface LogData {
  level: "info" | "warn" | "error" | "debug";
  message: string;
  projectId?: string;
  submissionId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export async function log(data: LogData) {
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] [${data.level.toUpperCase()}] ${data.message}`, {
    projectId: data.projectId,
    submissionId: data.submissionId,
    userId: data.userId,
    ...data.metadata,
  });

  if (logger) {
    try {
      await logger[data.level](data.message, {
        projectId: data.projectId,
        submissionId: data.submissionId,
        userId: data.userId,
        timestamp,
        ...data.metadata,
      });
    } catch (error) {
      console.error("Failed to send log to Logtail:", error);
    }
  }
}

export const logInfo = (message: string, data?: Omit<LogData, "level" | "message">) =>
  log({ level: "info", message, ...data });

export const logWarn = (message: string, data?: Omit<LogData, "level" | "message">) =>
  log({ level: "warn", message, ...data });

export const logError = (message: string, data?: Omit<LogData, "level" | "message">) =>
  log({ level: "error", message, ...data });

export const logDebug = (message: string, data?: Omit<LogData, "level" | "message">) =>
  log({ level: "debug", message, ...data });
