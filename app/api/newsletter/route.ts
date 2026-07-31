import { addSubscriber } from "../../../db";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENDER_API_URL = "https://api.sender.net/v2/subscribers";
const DEFAULT_SENDER_GROUP_ID = "dw5kA8";

function senderErrorMessage(payload: unknown, status: number) {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const message = record.message ?? record.error;

    if (typeof message === "string" && message.trim()) {
      return message;
    }

    if (record.errors && typeof record.errors === "object") {
      return JSON.stringify(record.errors);
    }
  }

  return `Sender rejected the subscription (${status})`;
}

async function subscribeWithSender(email: string) {
  const token = process.env.SENDER_API_TOKEN;
  const groupId = process.env.SENDER_GROUP_ID ?? DEFAULT_SENDER_GROUP_ID;

  if (!token) {
    throw new Error("Newsletter integration is not configured");
  }

  const response = await fetch(SENDER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email,
      groups: [groupId],
      trigger_automation: true,
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(senderErrorMessage(payload, response.status));
  }
}

async function saveLocally(email: string) {
  try {
    addSubscriber(email);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (!message.includes("UNIQUE constraint failed")) {
      // Sender is the source of truth. A local database problem must not stop
      // a valid signup or prevent the welcome automation from running.
      console.error("Unable to save newsletter subscriber locally", error);
    }
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { email?: string };
    const email = payload.email?.trim().toLowerCase() ?? "";

    if (!email || !EMAIL_PATTERN.test(email)) {
      return Response.json({ error: "A valid email is required" }, { status: 400 });
    }

    await subscribeWithSender(email);
    await saveLocally(email);

    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Newsletter signup failed", error);
    return Response.json(
      { error: "We could not add you right now. Please try again." },
      { status: 502 },
    );
  }
}
