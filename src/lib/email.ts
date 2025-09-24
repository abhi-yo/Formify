import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is required");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export interface FormSubmissionEmailData {
  projectName: string;
  projectId: string;
  submissionId: string;
  fields: Record<string, unknown>;
  submittedAt: Date;
  ipHash: string;
  userAgent: string;
}

export async function sendFormSubmissionEmail(
  to: string,
  data: FormSubmissionEmailData
) {
  const fieldRows = Object.entries(data.fields)
    .map(([key, value]) => `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${key}:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${value}</td></tr>`)
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New Form Submission - ${data.projectName}</h2>
      
      <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          ${fieldRows}
        </table>
      </div>
      
      <div style="margin: 20px 0; padding: 15px; background: #f0f0f0; border-radius: 4px; font-size: 14px; color: #666;">
        <p><strong>Submission Details:</strong></p>
        <p>Project: ${data.projectName}</p>
        <p>Submitted: ${data.submittedAt.toLocaleString()}</p>
        <p>IP Hash: ${data.ipHash.substring(0, 8)}...</p>
        <p>User Agent: ${data.userAgent.substring(0, 50)}...</p>
      </div>
      
      <p style="text-align: center; color: #888; font-size: 12px;">
        Powered by <a href="https://formify.dev" style="color: #0066cc;">Formify</a>
      </p>
    </div>
  `;

  return await resend.emails.send({
    from: "noreply@formify.dev",
    to,
    subject: `New form submission: ${data.projectName}`,
    html,
  });
}

export async function sendWelcomeEmail(to: string, userName: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to Formify! 🎉</h2>
      
      <p>Hi ${userName},</p>
      
      <p>Thanks for signing up for Formify! You're now ready to start collecting form submissions from your static websites.</p>
      
      <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Quick Start Guide:</h3>
        <ol>
          <li>Create your first project in the dashboard</li>
          <li>Get your unique form endpoint URL</li>
          <li>Add the endpoint to your HTML forms</li>
          <li>Start receiving submissions!</li>
        </ol>
      </div>
      
      <p>Need help? Check out our <a href="https://formify.dev/docs" style="color: #0066cc;">documentation</a> or reach out to support.</p>
      
      <p>Happy form building!</p>
      <p>The Formify Team</p>
    </div>
  `;

  return await resend.emails.send({
    from: "welcome@formify.dev",
    to,
    subject: "Welcome to Formify!",
    html,
  });
}
