import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SubmissionsTable } from "@/components/submissions-table";
import { ProjectSettings } from "@/components/project-settings";
import { EventLogs } from "@/components/event-logs";
import { AbuseAnalytics } from "@/components/abuse-analytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const resolvedParams = await params;
  const project = await db.project.findFirst({
    where: {
      id: resolvedParams.projectId,
      organization: {
        id: userId,
      },
    },
    include: {
      organization: true,
      submissions: {
        include: {
          attachments: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 100,
      },
      _count: {
        select: {
          submissions: true,
        },
      },
    },
  });

  if (!project) {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Organization: {project.organization.name}</span>
          <span>Total Submissions: {project._count.submissions}</span>
          <span>Public Key: {project.publicKey}</span>
        </div>
      </div>

      <Tabs defaultValue="submissions" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="submissions" className="mt-6">
          <SubmissionsTable
            submissions={project.submissions}
            projectId={project.id}
          />
        </TabsContent>
        
        <TabsContent value="integration" className="mt-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Integration Code</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">HTML Form Method</h3>
                <div className="bg-gray-100 p-4 rounded text-sm font-mono">
                  {`<form action="${process.env.NEXT_PUBLIC_APP_URL || "https://formify.app"}/api/submit" method="POST">
  <input type="hidden" name="project_key" value="${project.publicKey}">
  <input type="text" name="name" required>
  <input type="email" name="email" required>
  <textarea name="message"></textarea>
  <button type="submit">Send</button>
</form>`}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">JavaScript SDK (Coming Soon)</h3>
                <div className="bg-gray-100 p-4 rounded text-sm font-mono opacity-60">
                  {`<script src="${
                    process.env.NEXT_PUBLIC_APP_URL || "https://formify.app"
                  }/api/script.js" data-key="${project.publicKey}"></script>`}
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">API Details</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Endpoint:</strong> POST /api/submit</p>
                <p><strong>Public Key:</strong> {project.publicKey}</p>
                <p><strong>Secret Key:</strong> {project.secretKey.substring(0, 8)}... (Keep this private!)</p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <ProjectSettings 
            projectId={project.id}
            initialSettings={project.settings as Record<string, unknown>}
          />
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <AbuseAnalytics projectId={project.id} />
        </TabsContent>
        
        <TabsContent value="logs" className="mt-6">
          <EventLogs projectId={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
