"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayCircle, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface DemoSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
  status: "success" | "processing" | "error";
}

export function LiveDemo() {
  const [submissions, setSubmissions] = useState<DemoSubmission[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  // Simulate some existing submissions
  useEffect(() => {
    const sampleSubmissions: DemoSubmission[] = [
      {
        id: "demo-1",
        name: "John Doe",
        email: "john@example.com",
        message: "This is a test message from the demo!",
        timestamp: new Date(Date.now() - 300000).toISOString(),
        status: "success",
      },
      {
        id: "demo-2",
        name: "Jane Smith",
        email: "jane@example.com",
        message: "Another demo submission to show how it works.",
        timestamp: new Date(Date.now() - 600000).toISOString(),
        status: "success",
      },
    ];
    setSubmissions(sampleSubmissions);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newSubmission: DemoSubmission = {
      id: `demo-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      message: formData.message,
      timestamp: new Date().toISOString(),
      status: "processing",
    };

    setSubmissions((prev) => [newSubmission, ...prev]);

    // Simulate processing time
    setTimeout(() => {
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === newSubmission.id
            ? { ...sub, status: "success" as const }
            : sub
        )
      );
      setIsSubmitting(false);
      setFormData({ name: "", email: "", message: "" });
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-600 animate-spin" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <PlayCircle className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Formify Live Demo</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Try out Formify with this interactive demo. Submit the form below and
          watch your submission appear in real-time with all the security
          features in action.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Demo Form */}
        <Card>
          <CardHeader>
            <CardTitle>Demo Contact Form</CardTitle>
            <p className="text-sm text-gray-600">
              This form is powered by Formify with all security features
              enabled.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="demo-name">Name</Label>
                <Input
                  id="demo-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  placeholder="Your full name"
                />
              </div>

              <div>
                <Label htmlFor="demo-email">Email</Label>
                <Input
                  id="demo-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <Label htmlFor="demo-message">Message</Label>
                <textarea
                  id="demo-message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  required
                  placeholder="Tell us what you think about Formify!"
                  rows={4}
                  className="w-full px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                Security Features Active:
              </h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Rate Limiting</Badge>
                <Badge variant="secondary">Honeypot Detection</Badge>
                <Badge variant="secondary">HMAC Verification</Badge>
                <Badge variant="secondary">Spam Filtering</Badge>
                <Badge variant="secondary">IP Tracking</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Submissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Live Submissions
              <Badge variant="outline">{submissions.length}</Badge>
            </CardTitle>
            <p className="text-sm text-gray-600">
              Watch submissions appear in real-time as they&apos;re processed.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {submissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <PlayCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No submissions yet. Try the form!</p>
                </div>
              ) : (
                submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(submission.status)}
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(submission.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div>
                      <p className="font-medium">{submission.name}</p>
                      <p className="text-sm text-gray-600">
                        {submission.email}
                      </p>
                    </div>

                    <p className="text-sm bg-gray-50 p-2 rounded">
                      {submission.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>What Happens Behind the Scenes</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="security" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="security">Security Checks</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="security" className="mt-4">
              <div className="space-y-3">
                <h4 className="font-medium">Every submission goes through:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Rate limiting (10 submissions per minute per IP)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Honeypot field detection for bot filtering
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    HMAC signature verification for authenticity
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Content analysis for spam patterns
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Proof-of-work challenges for high-traffic sites
                  </li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="processing" className="mt-4">
              <div className="space-y-3">
                <h4 className="font-medium">Background processing includes:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Submission stored in secure database
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Email notifications queued via Inngest
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Event logging for audit trail
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Webhook delivery (if configured)
                  </li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="mt-4">
              <div className="space-y-3">
                <h4 className="font-medium">Notification options:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Email notifications to multiple recipients
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Custom email templates with submission details
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Retry logic for failed deliveries
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Real-time webhooks to your systems
                  </li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-4">
              <div className="space-y-3">
                <h4 className="font-medium">Analytics and monitoring:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Submission volume and trends
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Security violation tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Abuse prevention metrics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    CSV export for data analysis
                  </li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

