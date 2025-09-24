"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check } from "lucide-react";

interface CodeSnippetsProps {
  publicKey: string;
  secretKey: string;
}

export function CodeSnippets({ publicKey, secretKey }: CodeSnippetsProps) {
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copyToClipboard = (text: string, snippetId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(snippetId);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const baseURL = process.env.NEXT_PUBLIC_APP_URL || "https://formify.app";

  const snippets = {
    html: {
      title: "HTML Form",
      description: "Basic HTML form with Formify integration",
      code: `<form data-formify data-secret="${secretKey}">
  <div>
    <label for="name">Name:</label>
    <input type="text" id="name" name="name" required>
  </div>
  
  <div>
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required>
  </div>
  
  <div>
    <label for="message">Message:</label>
    <textarea id="message" name="message" rows="4" required></textarea>
  </div>
  
  <button type="submit">Send Message</button>
</form>

<script src="${baseURL}/api/script?key=${publicKey}&debug=true"></script>`,
    },
    
    react: {
      title: "React Component",
      description: "React form component using Formify SDK",
      code: `import { useEffect, useRef } from 'react';

export default function ContactForm() {
  const formRef = useRef(null);

  useEffect(() => {
    // Load Formify SDK
    const script = document.createElement('script');
    script.src = '${baseURL}/api/script?key=${publicKey}';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleSuccess = (result) => {
    console.log('Form submitted successfully:', result);
    alert('Thank you! Your message has been sent.');
  };

  const handleError = (error) => {
    console.error('Form submission error:', error);
    alert('Sorry, there was an error. Please try again.');
  };

  return (
    <form 
      ref={formRef}
      data-formify 
      data-secret="${secretKey}"
      data-on-success="handleSuccess"
      data-on-error="handleError"
      className="space-y-4"
    >
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="mt-1 block w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="mt-1 block w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          className="mt-1 block w-full rounded border px-3 py-2"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Send Message
      </button>
    </form>
  );
}`,
    },

    vue: {
      title: "Vue.js Component",
      description: "Vue form component with Formify integration",
      code: `<template>
  <form 
    ref="contactForm"
    data-formify 
    data-secret="${secretKey}"
    @submit.prevent="handleSubmit"
    class="space-y-4"
  >
    <div>
      <label for="name" class="block text-sm font-medium">Name</label>
      <input
        type="text"
        id="name"
        name="name"
        v-model="form.name"
        required
        class="mt-1 block w-full rounded border px-3 py-2"
      />
    </div>

    <div>
      <label for="email" class="block text-sm font-medium">Email</label>
      <input
        type="email"
        id="email"
        name="email"
        v-model="form.email"
        required
        class="mt-1 block w-full rounded border px-3 py-2"
      />
    </div>

    <div>
      <label for="message" class="block text-sm font-medium">Message</label>
      <textarea
        id="message"
        name="message"
        v-model="form.message"
        rows="4"
        required
        class="mt-1 block w-full rounded border px-3 py-2"
      />
    </div>

    <button
      type="submit"
      :disabled="isSubmitting"
      class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
    >
      {{ isSubmitting ? 'Sending...' : 'Send Message' }}
    </button>
  </form>
</template>

<script>
import { FormifySDK } from '${baseURL}/formify.js';

export default {
  name: 'ContactForm',
  data() {
    return {
      form: {
        name: '',
        email: '',
        message: ''
      },
      isSubmitting: false,
      formify: null
    };
  },
  
  mounted() {
    this.formify = new FormifySDK('${publicKey}', { debug: true });
  },
  
  methods: {
    async handleSubmit() {
      this.isSubmitting = true;
      
      try {
        const result = await this.formify.submitForm(this.$refs.contactForm, {
          secretKey: '${secretKey}'
        });
        
        alert('Thank you! Your message has been sent.');
        this.resetForm();
      } catch (error) {
        console.error('Submission error:', error);
        alert('Sorry, there was an error. Please try again.');
      } finally {
        this.isSubmitting = false;
      }
    },
    
    resetForm() {
      this.form = { name: '', email: '', message: '' };
    }
  }
};
</script>`,
    },

    javascript: {
      title: "Vanilla JavaScript",
      description: "Pure JavaScript implementation",
      code: `// Initialize Formify SDK
const formify = new FormifySDK('${publicKey}', { debug: true });

// Get form element
const form = document.getElementById('contact-form');

// Add honeypot field
const honeypot = document.createElement('input');
honeypot.type = 'text';
honeypot.name = 'website_url';
honeypot.style.cssText = 'position:absolute;left:-9999px;opacity:0;';
honeypot.setAttribute('tabindex', '-1');
form.appendChild(honeypot);

// Handle form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const submitButton = form.querySelector('[type="submit"]');
  const originalText = submitButton.textContent;
  
  try {
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    
    const result = await formify.submitForm(form, {
      secretKey: '${secretKey}'
    });
    
    console.log('Success:', result);
    alert('Thank you! Your message has been sent.');
    form.reset();
    
  } catch (error) {
    console.error('Error:', error);
    alert('Sorry, there was an error. Please try again.');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
});

// HTML for the form:
/*
<form id="contact-form">
  <input type="text" name="name" placeholder="Your Name" required>
  <input type="email" name="email" placeholder="Your Email" required>
  <textarea name="message" placeholder="Your Message" required></textarea>
  <button type="submit">Send Message</button>
</form>
*/`,
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Integration Code Snippets</h2>
        <p className="text-gray-600">
          Choose your preferred framework and copy the code to get started quickly.
        </p>
      </div>

      <Tabs defaultValue="html" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="html">HTML</TabsTrigger>
          <TabsTrigger value="react">React</TabsTrigger>
          <TabsTrigger value="vue">Vue.js</TabsTrigger>
          <TabsTrigger value="javascript">JavaScript</TabsTrigger>
        </TabsList>

        {Object.entries(snippets).map(([key, snippet]) => (
          <TabsContent key={key} value={key} className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {snippet.title}
                    <Badge variant="secondary">{key.toUpperCase()}</Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {snippet.description}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(snippet.code, key)}
                  className="flex items-center gap-2"
                >
                  {copiedSnippet === key ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copiedSnippet === key ? "Copied!" : "Copy"}
                </Button>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{snippet.code}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-yellow-600">⚠️</div>
            <div>
              <h4 className="font-medium text-yellow-800 mb-1">
                Security Note
              </h4>
              <p className="text-sm text-yellow-700">
                Your secret key is included in these examples for completeness, but{" "}
                <strong>never expose your secret key in client-side code</strong>.
                For production, implement server-side HMAC signing or use our
                upcoming server-side SDKs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
