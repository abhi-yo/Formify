"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

interface ProjectSettingsProps {
  projectId: string;
  initialSettings: {
    emailNotifications?: {
      enabled: boolean;
      recipients: string[];
    };
    webhooks?: {
      enabled: boolean;
      url: string;
    };
  };
}

export function ProjectSettings({ projectId, initialSettings }: ProjectSettingsProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const addEmailRecipient = () => {
    if (!newEmail || !newEmail.includes("@")) return;
    
    const recipients = settings.emailNotifications?.recipients || [];
    if (recipients.includes(newEmail)) return;

    setSettings({
      ...settings,
      emailNotifications: {
        ...settings.emailNotifications,
        enabled: settings.emailNotifications?.enabled || false,
        recipients: [...recipients, newEmail],
      },
    });
    setNewEmail("");
  };

  const removeEmailRecipient = (email: string) => {
    const recipients = settings.emailNotifications?.recipients || [];
    setSettings({
      ...settings,
      emailNotifications: {
        ...settings.emailNotifications,
        enabled: settings.emailNotifications?.enabled || false,
        recipients: recipients.filter(r => r !== email),
      },
    });
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Get notified when new form submissions are received
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="email-notifications"
              checked={settings.emailNotifications?.enabled || false}
              onCheckedChange={(enabled) =>
                setSettings({
                  ...settings,
                  emailNotifications: {
                    ...settings.emailNotifications,
                    enabled,
                    recipients: settings.emailNotifications?.recipients || [],
                  },
                })
              }
            />
            <Label htmlFor="email-notifications">Enable email notifications</Label>
          </div>

          {settings.emailNotifications?.enabled && (
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addEmailRecipient()}
                />
                <Button onClick={addEmailRecipient} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {(settings.emailNotifications.recipients || []).map((email) => (
                  <Badge key={email} variant="secondary" className="flex items-center gap-1">
                    {email}
                    <button
                      onClick={() => removeEmailRecipient(email)}
                      className="ml-1 hover:bg-gray-200 rounded"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhooks</CardTitle>
          <CardDescription>
            Send form submissions to your own endpoint
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="webhooks"
              checked={settings.webhooks?.enabled || false}
              onCheckedChange={(enabled) =>
                setSettings({
                  ...settings,
                  webhooks: {
                    ...settings.webhooks,
                    enabled,
                    url: settings.webhooks?.url || "",
                  },
                })
              }
            />
            <Label htmlFor="webhooks">Enable webhooks</Label>
          </div>

          {settings.webhooks?.enabled && (
            <div>
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                type="url"
                placeholder="https://your-site.com/webhook"
                value={settings.webhooks.url || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    webhooks: {
                      ...settings.webhooks,
                      enabled: settings.webhooks?.enabled || false,
                      url: e.target.value,
                    },
                  })
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={loading}>
          {loading ? "Saving..." : saved ? "Saved!" : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
