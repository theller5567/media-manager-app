import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    // TODO: Integrate with SendGrid
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // 
    // await sgMail.send({
    //   to: 'contact@mediamanager.app',
    //   from: 'noreply@mediamanager.app',
    //   subject: `Contact Form: ${name}`,
    //   text: `From: ${email}\n\n${message}`,
    // });

    // For now, just log the data
    console.log("Contact form submission:", { name, email, message });

    return NextResponse.json(
      { message: "Thank you for your message. We'll be in touch soon!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
