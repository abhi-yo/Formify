import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "formify",
  name: "Formify Background Jobs",
});

export interface SendEmailJobData {
  type: "form_submission" | "welcome";
  to: string;
  projectId?: string;
  submissionId?: string;
  userName?: string;
}

export const sendEmailJob = inngest.createFunction(
  {
    id: "send-email",
    name: "Send Email Notification",
    retries: 3,
  },
  { event: "email/send" },
  async ({ event, step }) => {
    const { data } = event.data as { data: SendEmailJobData };

    return await step.run("send-email", async () => {
      const { sendFormSubmissionEmail, sendWelcomeEmail } = await import("./email");
      const { db } = await import("./db");

      try {
        if (data.type === "form_submission" && data.projectId && data.submissionId) {
          const submission = await db.submission.findUnique({
            where: { id: data.submissionId },
            include: {
              project: {
                include: { organization: true }
              }
            }
          });

          if (!submission) {
            throw new Error(`Submission ${data.submissionId} not found`);
          }

          await sendFormSubmissionEmail(data.to, {
            projectName: submission.project.name,
            projectId: submission.project.id,
            submissionId: submission.id,
            fields: submission.fieldsJSON as Record<string, unknown>,
            submittedAt: submission.createdAt,
            ipHash: submission.ipHash,
            userAgent: submission.userAgent || "Unknown",
          });

          await db.eventLog.create({
            data: {
              projectId: submission.project.id,
              type: "EMAIL_SENT",
              metaJSON: {
                to: data.to,
                submissionId: data.submissionId,
                type: "form_submission"
              }
            }
          });

        } else if (data.type === "welcome" && data.userName) {
          await sendWelcomeEmail(data.to, data.userName);
        }

        return { success: true, emailType: data.type };
      } catch (error) {
        console.error("Email send failed:", error);
        
        if (data.projectId) {
          await db.eventLog.create({
            data: {
              projectId: data.projectId,
              type: "EMAIL_FAILED",
              metaJSON: {
                to: data.to,
                error: error instanceof Error ? error.message : "Unknown error",
                type: data.type
              }
            }
          });
        }
        
        throw error;
      }
    });
  }
);

export const processSubmissionJob = inngest.createFunction(
  {
    id: "process-submission",
    name: "Process Form Submission",
    retries: 2,
  },
  { event: "submission/created" },
  async ({ event, step }) => {
    const { submissionId, projectId } = event.data;

    const project = await step.run("fetch-project", async () => {
      const { db } = await import("./db");
      return await db.project.findUnique({
        where: { id: projectId },
        include: { organization: true }
      });
    });

    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    const settings = project.settings as Record<string, unknown>;
    const emailNotifications = settings.emailNotifications as Record<string, unknown>;

    if (emailNotifications?.enabled && emailNotifications?.recipients) {
      await step.run("queue-email-notifications", async () => {
        const recipients = emailNotifications.recipients as string[];
        
        for (const recipient of recipients) {
          await inngest.send({
            name: "email/send",
            data: {
              data: {
                type: "form_submission",
                to: recipient,
                projectId,
                submissionId,
              } as SendEmailJobData
            }
          });
        }
      });
    }

    await step.run("log-processing-complete", async () => {
      const { db } = await import("./db");
      await db.eventLog.create({
        data: {
          projectId,
          type: "SUBMISSION_PROCESSED",
          metaJSON: {
            submissionId,
            emailsSent: emailNotifications?.enabled ? 
              (emailNotifications.recipients as string[]).length : 0
          }
        }
      });
    });

    return { success: true, submissionId, emailsSent: emailNotifications?.enabled };
  }
);
