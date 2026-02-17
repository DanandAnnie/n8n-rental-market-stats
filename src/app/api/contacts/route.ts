import { NextRequest, NextResponse } from "next/server";

const getWebhookUrl = () => {
  let url = process.env.N8N_CONTACTS_WEBHOOK_URL;
  if (url?.startsWith("N8N_CONTACTS_WEBHOOK_URL=")) {
    url = url.replace("N8N_CONTACTS_WEBHOOK_URL=", "");
  }
  return url?.trim();
};

async function callWebhook(action: string, data?: Record<string, unknown>) {
  const webhookUrl = getWebhookUrl();
  if (!webhookUrl) {
    return NextResponse.json(
      { error: "N8N_CONTACTS_WEBHOOK_URL not configured" },
      { status: 500 }
    );
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...data }),
  });

  const text = await response.text();
  if (!response.ok) {
    return NextResponse.json(
      { error: `Webhook returned ${response.status}`, detail: text.substring(0, 500) },
      { status: 502 }
    );
  }

  try {
    return NextResponse.json(JSON.parse(text));
  } catch {
    return NextResponse.json({ error: "Invalid JSON from webhook" }, { status: 502 });
  }
}

export async function GET() {
  return callWebhook("list");
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return callWebhook("add", body);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  return callWebhook("update", body);
}

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  return callWebhook("delete", body);
}
