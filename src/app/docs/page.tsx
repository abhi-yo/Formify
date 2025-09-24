import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Code, 
  Shield, 
  Zap, 
  Mail, 
  BarChart, 
  ExternalLink,
  CheckCircle
} from "lucide-react";

export default function DocsPage() {
  const features = [
    {
      icon: <Shield className="h-6 w-6 text-blue-600" />,
      title: "Advanced Security",
      description: "Rate limiting, proof-of-work, honeypots, and spam detection",
      items: ["HMAC signature verification", "IP-based rate limiting", "Bot detection", "Content analysis"]
    },
    {
      icon: <Mail className="h-6 w-6 text-green-600" />,
      title: "Email Notifications",
      description: "Reliable email delivery with custom templates",
      items: ["Multiple recipients", "Custom templates", "Retry logic", "Delivery tracking"]
    },
    {
      icon: <BarChart className="h-6 w-6 text-purple-600" />,
      title: "Analytics & Monitoring",
      description: "Comprehensive insights into form performance",
      items: ["Submission analytics", "Security metrics", "CSV exports", "Real-time logs"]
    },
    {
      icon: <Zap className="h-6 w-6 text-yellow-600" />,
      title: "Background Processing",
      description: "Reliable job processing with Inngest",
      items: ["Async email sending", "Webhook delivery", "Retry mechanisms", "Error handling"]
    }
  ];

  const integrations = [
    {
      name: "HTML Forms",
      description: "Simple form integration with data attributes",
      code: `<form data-formify data-secret="your-secret">
  <input name="email" type="email" required>
  <button type="submit">Submit</button>
</form>`
    },
    {
      name: "React",
      description: "React component with hooks integration",
      code: `const { formify } = useFormify('your-api-key');
const handleSubmit = (e) => {
  formify.submitForm(e.target);
};`
    },
    {
      name: "Vue.js",
      description: "Vue component with reactive data binding",
      code: `const formify = new FormifySDK('your-api-key');
await formify.submitForm(this.$refs.form);`
    },
    {
      name: "REST API",
      description: "Direct API integration for custom implementations",
      code: `POST /api/submit
{
  "projectKey": "pub_...",
  "fields": { "email": "user@example.com" },
  "signature": "hmac-signature"
}`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">
                Formify Documentation
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to integrate secure, reliable form processing
              into your static websites and applications.
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <Button asChild>
                <Link href="/demo">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Try Live Demo
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/sign-up">Get Started Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Start */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Quick Start</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <CardTitle>Create Project</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Sign up and create your first project to get your API keys.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <CardTitle>Add Script</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Include the Formify script in your HTML with your API key.
                </p>
                <div className="mt-3 p-2 bg-gray-100 rounded text-xs font-mono">
                  {`<script src="https://formify.app/api/script?key=pub_..."></script>`}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <CardTitle>Configure Form</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Add data-formify attribute to your forms and you're ready!
                </p>
                <div className="mt-3 p-2 bg-gray-100 rounded text-xs font-mono">
                  {`<form data-formify>...</form>`}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {feature.icon}
                    <div>
                      <CardTitle>{feature.title}</CardTitle>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Integration Examples */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Integration Examples</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {integrations.map((integration, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      {integration.name}
                    </CardTitle>
                    <Badge variant="outline">Example</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{integration.description}</p>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{integration.code}</code>
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* API Reference */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">API Reference</h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit Form Data</CardTitle>
                <Badge variant="outline">POST /api/submit</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Request Body</h4>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
{`{
  "projectKey": "pub_1234567890abcdef",
  "fields": {
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Hello world!"
  },
  "honeypot": "",
  "timestamp": 1640995200000,
  "signature": "hmac-sha256-signature",
  "proofOfWork": {
    "challenge": "abc123",
    "nonce": "456789",
    "timestamp": 1640995200000
  }
}`}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Response</h4>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
{`{
  "success": true,
  "submissionId": "sub_1234567890abcdef"
}`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Load Dynamic Script</CardTitle>
                <Badge variant="outline">GET /api/script</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Query Parameters</h4>
                    <ul className="space-y-2">
                      <li><code className="bg-gray-100 px-2 py-1 rounded">key</code> - Your project's public key</li>
                      <li><code className="bg-gray-100 px-2 py-1 rounded">debug</code> - Enable debug logging (optional)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Example</h4>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
{`<script src="https://formify.app/api/script?key=pub_1234567890abcdef&debug=true"></script>`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Security */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Security</h2>
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-4">Built-in Protection</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-sm">HMAC signature verification</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Rate limiting by IP</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Honeypot bot detection</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Content spam filtering</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Proof-of-work challenges</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Best Practices</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Keep your secret key private and server-side only</li>
                    <li>• Use HTTPS for all form submissions</li>
                    <li>• Implement client-side validation for better UX</li>
                    <li>• Monitor your analytics for suspicious activity</li>
                    <li>• Set up email notifications for important forms</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Get Started CTA */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-gray-600 mb-6">
                Join thousands of developers using Formify for secure, reliable form processing.
              </p>
              <div className="flex justify-center gap-4">
                <Button asChild size="lg">
                  <Link href="/sign-up">Start Free Trial</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/demo">Try Live Demo</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
