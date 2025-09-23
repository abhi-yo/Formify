import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SubmissionsTable } from "@/components/submissions-table";

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

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Integration Code</h2>
        <div className="bg-gray-100 p-4 rounded text-sm font-mono">
          {`<script src="${
            process.env.NEXT_PUBLIC_APP_URL || "https://formify.app"
          }/api/script.js" data-key="${project.publicKey}"></script>`}
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Add this script tag to your HTML page and add data-formify attribute
          to your forms.
        </p>
      </div>

      <SubmissionsTable
        submissions={project.submissions}
        projectId={project.id}
      />
    </div>
  );
}
