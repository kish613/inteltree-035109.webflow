export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, message } = req.body;
    
    console.log('Contact form API called with:', { name, email, hasMessage: !!message });

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Get Resend API key from environment
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is not set');
      console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('RESEND')));
      return res.status(500).json({ error: 'Email service configuration error - API key missing' });
    }

    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: ['jacob@streetle.co.uk'],
        subject: `New Contact Form Enquiry from ${name}`,
        html: `
          <h2>New Contact Form Enquiry</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${message ? `<p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br>')}</p>` : ''}
          <hr>
          <p style="color: #666; font-size: 12px;">This email was sent from the IntelTree contact form.</p>
        `,
        text: `
New Contact Form Enquiry

Name: ${name}
Email: ${email}
${message ? `\nMessage:\n${message}` : ''}

---
This email was sent from the IntelTree contact form.
        `.trim(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Resend API error:', errorData);
      console.error('Resend API status:', response.status);
      console.error('Resend API statusText:', response.statusText);
      return res.status(500).json({ 
        error: 'Failed to send email',
        details: errorData.message || errorData
      });
    }

    const data = await response.json();
    
    return res.status(200).json({ 
      success: true, 
      message: 'Thank you! Your message has been sent successfully.',
      id: data.id 
    });

  } catch (error) {
    console.error('Error processing contact form:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
