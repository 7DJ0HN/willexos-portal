import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { log_text } = await req.json();

    if (!log_text || typeof log_text !== "string") {
      return NextResponse.json({ error: "log_text missing" }, { status: 400 });
    }

    const apiUrl = process.env.BELLATRON_API_URL;
    const apiKey = process.env.BELLATRON_API_KEY;

    if (!apiUrl || !apiKey) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const r = await fetch(`${apiUrl}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({ log_text }),
    });

    const data = await r.json();
    return NextResponse.json(data, { status: r.status });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
