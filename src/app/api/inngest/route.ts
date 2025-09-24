import { serve } from "inngest/next";
import { inngest, sendEmailJob, processSubmissionJob } from "@/lib/inngest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    sendEmailJob,
    processSubmissionJob,
  ],
});
