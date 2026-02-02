import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name, email, company, message } = await request.json();

    // TODO: Store in database or integrate with CRM
    // TODO: Send email via SendGrid
    // TODO: Add to calendar (Calendly, etc.)

    // For now, just log the data
    console.log("Demo request:", { name, email, company, message });

    return NextResponse.json(
      { message: "Thank you for your interest! We'll contact you soon to schedule your demo." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Demo request error:", error);
    return NextResponse.json(
      { error: "Failed to submit demo request. Please try again." },
      { status: 500 }
    );
  }
}
