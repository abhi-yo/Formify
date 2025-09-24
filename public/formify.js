(function() {
  'use strict';

  class FormifySDK {
    constructor(apiKey, options = {}) {
      this.apiKey = apiKey;
      this.baseURL = options.baseURL || 'https://formify.app';
      this.debug = options.debug || false;
      this.proofOfWork = null;
      
      this.log('Formify SDK initialized', { apiKey: apiKey.substring(0, 8) + '...' });
    }

    log(...args) {
      if (this.debug) {
        console.log('[Formify]', ...args);
      }
    }

    async generateHMAC(data, secret) {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
      return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }

    async solveProofOfWork(challenge, difficulty) {
      return new Promise((resolve) => {
        let nonce = 0;
        const target = "0".repeat(difficulty);
        
        const solve = async () => {
          for (let i = 0; i < 10000; i++) {
            const hash = await this.sha256(challenge + nonce);
            if (hash.startsWith(target)) {
              resolve({
                challenge: challenge,
                nonce: nonce.toString(),
                timestamp: Date.now()
              });
              return;
            }
            nonce++;
          }
          setTimeout(solve, 0);
        };
        
        solve();
      });
    }

    async sha256(message) {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    createHoneypot() {
      const fields = ['email_address', 'website_url', 'company_name', 'phone_number'];
      const field = fields[Math.floor(Math.random() * fields.length)];
      
      const input = document.createElement('input');
      input.type = 'text';
      input.name = field;
      input.style.cssText = 'position:absolute;left:-9999px;opacity:0;pointer-events:none;';
      input.tabIndex = -1;
      input.setAttribute('aria-hidden', 'true');
      
      return input;
    }

    async submitForm(form, options = {}) {
      try {
        this.log('Submitting form', form);
        
        const formData = new FormData(form);
        const fields = {};
        
        for (let [key, value] of formData.entries()) {
          if (key !== 'honeypot' && !key.includes('email_address') && !key.includes('website_url')) {
            fields[key] = value;
          }
        }

        const timestamp = Date.now();
        const dataToSign = JSON.stringify({ 
          projectKey: this.apiKey, 
          fields, 
          timestamp 
        });

        let payload = {
          projectKey: this.apiKey,
          fields,
          honeypot: formData.get('honeypot') || '',
          timestamp,
          signature: await this.generateHMAC(dataToSign, options.secretKey || '')
        };

        if (this.proofOfWork) {
          payload.proofOfWork = this.proofOfWork;
          this.proofOfWork = null;
        }

        const response = await fetch(`${this.baseURL}/api/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.status === 400 && result.error === 'Proof of work required') {
          this.log('Proof of work required, solving challenge...');
          const challenge = result.challenge;
          this.proofOfWork = await this.solveProofOfWork(challenge.challenge || Math.random().toString(), challenge.difficulty);
          
          payload.proofOfWork = this.proofOfWork;
          const retryResponse = await fetch(`${this.baseURL}/api/submit`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
          });
          
          return await retryResponse.json();
        }

        if (!response.ok) {
          throw new Error(result.error || 'Submission failed');
        }

        this.log('Form submitted successfully', result);
        return result;

      } catch (error) {
        this.log('Form submission error', error);
        throw error;
      }
    }

    init() {
      document.addEventListener('DOMContentLoaded', () => {
        const forms = document.querySelectorAll('[data-formify]');
        
        forms.forEach(form => {
          const honeypot = this.createHoneypot();
          form.appendChild(honeypot);
          
          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitButton = form.querySelector('[type="submit"]');
            const originalText = submitButton?.textContent;
            
            try {
              if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Sending...';
              }
              
              const result = await this.submitForm(form, {
                secretKey: form.dataset.secret
              });
              
              const successCallback = form.dataset.onSuccess;
              if (successCallback && window[successCallback]) {
                window[successCallback](result);
              } else {
                alert('Thank you! Your message has been sent.');
                form.reset();
              }
              
            } catch (error) {
              const errorCallback = form.dataset.onError;
              if (errorCallback && window[errorCallback]) {
                window[errorCallback](error);
              } else {
                alert('Sorry, there was an error sending your message. Please try again.');
              }
            } finally {
              if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
              }
            }
          });
        });
      });
    }
  }

  // Auto-initialize if API key is provided via script tag
  const scripts = document.querySelectorAll('script[data-formify-key]');
  if (scripts.length > 0) {
    const script = scripts[scripts.length - 1];
    const apiKey = script.getAttribute('data-formify-key');
    const debug = script.getAttribute('data-debug') === 'true';
    
    window.formify = new FormifySDK(apiKey, { debug });
    window.formify.init();
  }

  // Export for manual initialization
  window.FormifySDK = FormifySDK;
})();
