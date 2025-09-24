"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Shield, AlertTriangle, Ban } from "lucide-react";

interface AbuseMetrics {
  totalSubmissions: number;
  blockedSubmissions: number;
  securityViolations: number;
  rateLimitHits: number;
  honeypotTriggers: number;
  proofOfWorkChallenges: number;
  topViolationReasons: Array<{
    reason: string;
    count: number;
  }>;
  recentViolations: Array<{
    id: string;
    type: string;
    createdAt: string;
    metaJSON: Record<string, unknown>;
  }>;
}

interface AbuseAnalyticsProps {
  projectId: string;
}

export function AbuseAnalytics({ projectId }: AbuseAnalyticsProps) {
  const [metrics, setMetrics] = useState<AbuseMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("24h");

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/analytics?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
      }
    } catch (error) {
      console.error("Failed to fetch abuse metrics:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMetrics();
  }, [projectId, timeRange]);

  if (loading || !metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Abuse Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const blockRate = metrics.totalSubmissions > 0 
    ? ((metrics.blockedSubmissions / metrics.totalSubmissions) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Abuse Analytics</h2>
        <div className="flex items-center gap-2">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1 border rounded text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMetrics}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold">{metrics.totalSubmissions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Blocked</p>
                <p className="text-2xl font-bold">{metrics.blockedSubmissions}</p>
                <p className="text-xs text-gray-500">{blockRate}% block rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Security Violations</p>
                <p className="text-2xl font-bold">{metrics.securityViolations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Rate Limited</p>
                <p className="text-2xl font-bold">{metrics.rateLimitHits}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Violation Reasons</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.topViolationReasons.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No violations recorded</p>
            ) : (
              <div className="space-y-3">
                {metrics.topViolationReasons.map((reason, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{reason.reason.replace(/_/g, " ")}</span>
                    <Badge variant="secondary">{reason.count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Security Events</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.recentViolations.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No recent violations</p>
            ) : (
              <div className="space-y-3">
                {metrics.recentViolations.slice(0, 5).map((violation) => (
                  <div key={violation.id} className="border rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge 
                        variant={violation.type === "SECURITY_VIOLATION" ? "destructive" : "secondary"}
                      >
                        {violation.type.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(violation.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {violation.metaJSON.reason && (
                      <p className="text-sm text-gray-600">
                        {String(violation.metaJSON.reason).replace(/_/g, " ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
