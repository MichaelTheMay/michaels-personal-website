import { NextResponse } from "next/server";

const RESEND_API = "https://api.resend.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fail(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(request: Request) {
  let body: { email?: unknown; website?: unknown };
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request.", 400);
  }

  // Honeypot: a filled hidden field means a bot. Look successful, do nothing.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return fail("Enter a valid email address.", 400);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!apiKey || !audienceId) {
    return fail("Subscriptions are temporarily unavailable.", 500);
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  try {
    const created = await fetch(
      `${RESEND_API}/audiences/${audienceId}/contacts`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ email, unsubscribed: false }),
      }
    );

    if (created.ok) return NextResponse.json({ ok: true });

    // Already on the list. Re-subscribing someone who previously opted out is
    // the common case here, so flip the flag back rather than erroring.
    const revived = await fetch(
      `${RESEND_API}/audiences/${audienceId}/contacts/${encodeURIComponent(email)}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ unsubscribed: false }),
      }
    );

    if (revived.ok) return NextResponse.json({ ok: true });

    console.error(
      "resend subscribe failed",
      created.status,
      revived.status,
      await revived.text().catch(() => "")
    );
    return fail("Could not add you right now. Try again shortly.", 502);
  } catch (error) {
    console.error("resend subscribe error", error);
    return fail("Could not add you right now. Try again shortly.", 502);
  }
}
