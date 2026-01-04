import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const apiUrl = process.env.BELLA_API_URL;
  const apiKey = process.env.BELLA_API_KEY;

  if (!apiUrl || !apiKey) {
    return NextResponse.json(
      { error: "BELLA API not configured" },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body?.log_text) {
    return NextResponse.json(
      { error: "log_text is required" },
      { status: 400 }
    );
  }

  const res = await fetch(`${apiUrl}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify({ log_text: body.log_text }),
  });

  const text = await res.text();

  return new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/json",
    },
  });
}
