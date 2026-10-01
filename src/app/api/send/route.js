import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { email, subject, message } = await request.json();

    // 1. Send notification to Anshveer
    const notifyAnshveer = resend.emails.send({
      from: 'Anshveer Portfolio <noreply@anshveersingh.in>',
      to: ['singhanshveer73@gmail.com'],
      reply_to: email,
      subject: `PORTFOLIO: ${subject || 'New message'}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>New Message from Portfolio AI Chat</h2>
          <p><strong>From:</strong> ${email}</p>
          <hr />
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `,
    });

    // 2. Send nice welcome auto-reply to the visitor
    const replyVisitor = resend.emails.send({
      from: 'Anshveer Singh <noreply@anshveersingh.in>',
      to: [email],
      reply_to: 'singhanshveer73@gmail.com',
      subject: 'Thank you for reaching out!',
      html: `
        <div style="font-family: sans-serif; padding: 30px; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; border-radius: 8px;">
          <h2 style="color: #3b82f6;">Hello! 👋</h2>
          <p>Thank you for reaching out through my portfolio's AI Assistant.</p>
          <p>I have successfully received your message and will get back to you as soon as possible.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <h4 style="color: #333;">Communication Details:</h4>
          <ul>
            <li><strong>Email:</strong> singhanshveer73@gmail.com</li>
            <li><strong>Phone:</strong> +91 7795478003</li>
          </ul>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Best regards,<br/>
            <strong>Anshveer Singh</strong><br/>
            Computer Science and Engineering student
          </p>
        </div>
      `,
    });

    // Run both email sending tasks simultaneously
    const [notifyData, replyData] = await Promise.all([notifyAnshveer, replyVisitor]);

    // Check for Resend API errors
    if (notifyData.error) throw new Error(notifyData.error.message);
    if (replyData.error) throw new Error(replyData.error.message);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Resend Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
