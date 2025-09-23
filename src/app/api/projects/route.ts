import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { generateKeys } from "@/lib/utils";
import { projectSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, settings } = projectSchema.parse(body);

    // Create or get user's default organization
    let organization = await db.organization.findFirst({
      where: { id: userId },
    });

    if (!organization) {
      organization = await db.organization.create({
        data: {
          id: userId,
          name: "Personal",
        },
      });
    }

    // Generate public and secret keys
    const { publicKey, secretKey } = generateKeys();

    // Create the project
    const project = await db.project.create({
      data: {
        name,
        orgId: organization.id,
        publicKey,
        secretKey,
        settings: settings || {},
      },
    });

    await db.eventLog.create({
      data: {
        projectId: project.id,
        type: "project_created",
        metaJSON: {
          projectName: name,
          userId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        publicKey: project.publicKey,
        createdAt: project.createdAt,
      },
    });
  } catch (error) {
    console.error("Project creation error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await db.project.findMany({
      where: {
        organization: {
          id: userId,
        },
      },
      include: {
        organization: true,
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Get projects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
