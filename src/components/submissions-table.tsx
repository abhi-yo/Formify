"use client";

import { useState } from "react";
import { formatDate, formatBytes } from "@/lib/utils";
import { Submission, Attachment } from "@prisma/client";

interface SubmissionWithAttachments extends Submission {
  attachments: Attachment[];
}

interface SubmissionsTableProps {
  submissions: SubmissionWithAttachments[];
  projectId: string;
}

export function SubmissionsTable({
  submissions,
  projectId,
}: SubmissionsTableProps) {
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionWithAttachments | null>(null);

  const exportCSV = async () => {
    try {
      const response = await fetch(`/api/export/${projectId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `submissions-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Submissions</h2>
        <button
          onClick={exportCSV}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fields
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attachments
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {submissions.map((submission) => (
              <tr key={submission.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(submission.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      submission.status === "received"
                        ? "bg-blue-100 text-blue-800"
                        : submission.status === "forwarded"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {submission.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {
                    Object.keys(
                      submission.fieldsJSON as Record<string, unknown>
                    ).length
                  }{" "}
                  fields
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {submission.attachments.length > 0 ? (
                    <div className="space-y-1">
                      {submission.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center space-x-2"
                        >
                          <span className="text-xs text-gray-500">
                            {formatBytes(attachment.size)}
                          </span>
                          <a
                            href={`/api/download/${attachment.id}`}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">None</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => setSelectedSubmission(submission)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Submission Details</h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Form Data:</h4>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-sm overflow-x-auto">
                  {JSON.stringify(selectedSubmission.fieldsJSON, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-medium">Metadata:</h4>
                <div className="mt-2 text-sm space-y-1">
                  <p>
                    <strong>ID:</strong> {selectedSubmission.id}
                  </p>
                  <p>
                    <strong>Created:</strong>{" "}
                    {formatDate(selectedSubmission.createdAt)}
                  </p>
                  <p>
                    <strong>Status:</strong> {selectedSubmission.status}
                  </p>
                  <p>
                    <strong>User Agent:</strong>{" "}
                    {selectedSubmission.userAgent || "Unknown"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
