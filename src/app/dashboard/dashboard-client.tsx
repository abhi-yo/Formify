"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CreateProjectModal } from "@/components/create-project-modal";

interface Project {
  id: string;
  name: string;
  publicKey: string;
  createdAt: string;
  organization: {
    name: string;
  };
  _count: {
    submissions: number;
  };
}

export function DashboardClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white p-6 rounded-lg shadow-md border"
          >
            <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
            <p className="text-gray-600 mb-4">
              Organization: {project.organization.name}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {project._count.submissions} submissions
              </span>
              <Link
                href={`/dashboard/projects/${project.id}`}
                className="text-blue-600 hover:text-blue-800"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <h2 className="text-xl text-gray-600 mb-4">No projects yet</h2>
          <p className="text-gray-500 mb-6">
            Create your first project to start collecting form submissions.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            Create Your First Project
          </button>
        </div>
      )}

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
