import { NextRequest, NextResponse } from "next/server";

// Extend timeout for n8n webhook (research + AI takes ~20s)
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    let webhookUrl = process.env.N8N_WEBHOOK_URL;
    // Fix malformed env var (Vercel stored as "N8N_WEBHOOK_URL=https://...")
    if (webhookUrl?.startsWith("N8N_WEBHOOK_URL=")) {
      webhookUrl = webhookUrl.replace("N8N_WEBHOOK_URL=", "");
    }
    webhookUrl = webhookUrl?.trim();
    if (!webhookUrl) {
      return NextResponse.json(
        { error: "N8N_WEBHOOK_URL not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `n8n webhook returned ${response.status}`,
          detail: responseText.substring(0, 500),
        },
        { status: 502 }
      );
    }

    try {
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON from webhook", detail: responseText.substring(0, 500) },
        { status: 502 }
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to execute workflow", detail: message },
      { status: 500 }
    );
  }
}
