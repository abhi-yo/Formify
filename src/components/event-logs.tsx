"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface EventLog {
  id: string;
  type: string;
  metaJSON: Record<string, unknown>;
  createdAt: string;
}

interface EventLogsProps {
  projectId: string;
}

export function EventLogs({ projectId }: EventLogsProps) {
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/logs`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case "SUBMISSION_RECEIVED":
        return "bg-green-100 text-green-800";
      case "EMAIL_SENT":
        return "bg-blue-100 text-blue-800";
      case "EMAIL_FAILED":
        return "bg-red-100 text-red-800";
      case "SETTINGS_UPDATED":
        return "bg-yellow-100 text-yellow-800";
      case "SUBMISSION_PROCESSED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatLogType = (type: string) => {
    return type.split("_").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(" ");
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Event Logs</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchLogs}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No events recorded yet</p>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getLogTypeColor(log.type)}>
                    {formatLogType(log.type)}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
                
                {Object.keys(log.metaJSON).length > 0 && (
                  <div className="mt-2">
                    <details className="cursor-pointer">
                      <summary className="text-sm font-medium text-gray-600 hover:text-gray-800">
                        View Details
                      </summary>
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(log.metaJSON, null, 2)}
                        </pre>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
