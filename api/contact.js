export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, message } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Get Resend API key from environment
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is not set');
      return res.status(500).json({ error: 'Email service configuration error' });
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
      return res.status(500).json({ error: 'Failed to send email' });
    }

    const data = await response.json();
    
    return res.status(200).json({ 
      success: true, 
      message: 'Thank you! Your message has been sent successfully.',
      id: data.id 
    });

  } catch (error) {
    console.error('Error processing contact form:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}
