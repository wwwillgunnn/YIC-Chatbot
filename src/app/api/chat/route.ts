import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { execFile } from "child_process";
import path from "path";
import { promisify } from "util";
import { DEVICE_WHITELIST, DeviceName, DeviceAction } from "@/config/devices";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const execFileAsync = promisify(execFile);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL_INTENT = process.env.GROQ_MODEL_INTENT ?? "llama-3.1-8b-instant";
const MODEL_CHAT   = process.env.GROQ_MODEL_CHAT   ?? "llama-3.3-70b-versatile";
const CONF_THRESHOLD = Number(process.env.INTENT_CONF ?? 0.65);

type IntentResult = {
  intent: DeviceAction | "none";
  device: DeviceName | null;
  confidence: number;
  reason: string;
};

function devicesList() {
  return Object.keys(DEVICE_WHITELIST).map(d => `"${d}"`).join(", ");
}

async function extractIntent(message: string): Promise<IntentResult> {
  const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        `Extract intent for YIC devices.\n` +
        `Return ONLY JSON: {intent, device, confidence, reason}.\n` +
        `intent: "turn_on"|"turn_off"|"none"\n` +
        `device: one of ${devicesList()} or null\n` +
        `confidence: 0..1\n` +
        `reason: short`
    },
    { role: "user", content: `Devices: ${JSON.stringify(DEVICE_WHITELIST)}` },
    { role: "user", content: "turn on the ceiling lights" },
    { role: "assistant", content: JSON.stringify({ intent: "turn_on", device: "lights", confidence: 0.92, reason: "Ceiling implies lights" }) },
    { role: "user", content: "switch off the fan please" },
    { role: "assistant", content: JSON.stringify({ intent: "turn_off", device: "fan", confidence: 0.9, reason: "Mentions fan explicitly" }) },
    { role: "user", content: "what's the temperature?" },
    { role: "assistant", content: JSON.stringify({ intent: "none", device: null, confidence: 0.3, reason: "No supported action" }) },
    { role: "user", content: message }
  ];

  const completion = await groq.chat.completions.create({
    model: MODEL_INTENT,
    temperature: 0,
    messages
  });

  const raw = completion.choices[0]?.message?.content?.trim() || "{}";
  try {
    const parsed = JSON.parse(raw);
    return {
      intent: parsed.intent ?? "none",
      device: parsed.device ?? null,
      confidence: Number(parsed.confidence ?? 0),
      reason: parsed.reason ?? ""
    };
  } catch {
    return { intent: "none", device: null, confidence: 0, reason: "bad JSON" };
  }
}

async function runSerialAction(device: DeviceName, action: DeviceAction) {
  // whitelist check (cheap + essential)
  const cfg = DEVICE_WHITELIST[device];
  if (!cfg || !cfg.actions.includes(action)) {
    return { ok: false, error: "DISALLOWED", details: { device, action } };
  }

  const script = path.resolve("src/services/yic_control.py");
  const python = process.env.PYTHON_EXE || (process.platform === "win32" ? "python" : "python3");
  const args = [script, "--device", device, "--action", action];

  try {
    const { stdout, stderr } = await execFileAsync(python, args, { timeout: 10_000, windowsHide: true });
    let data: any = null;
    try { data = stdout ? JSON.parse(stdout.trim()) : null; } catch { /* non-JSON stdout */ }
    if (!data?.ok) {
      return { ok: false, error: data?.error || "PYTHON_ERROR", details: { stdout: stdout?.trim(), stderr: stderr?.trim() } };
    }
    return { ok: true, data, details: { stderr: stderr?.trim() } };
  } catch (e: any) {
    return { ok: false, error: "EXEC_ERROR", details: { message: e?.message, code: e?.code, stderr: e?.stderr?.toString?.() } };
  }
}

async function smalltalk(message: string) {
  const completion = await groq.chat.completions.create({
    model: MODEL_CHAT,
    messages: [
      { role: "system", content: "You are a friendly, helpful chatbot. Keep replies concise." },
      { role: "user", content: message }
    ]
  });
  return completion.choices[0]?.message?.content || "Hmm, I’m lost for words.";
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Empty message." }, { status: 400 });
    }

    const parsed = await extractIntent(message);

    // only execute when confident + fully specified
    if (parsed.intent !== "none" && parsed.device && parsed.confidence >= CONF_THRESHOLD) {
      const res = await runSerialAction(parsed.device, parsed.intent as DeviceAction);
      if (res.ok) {
        return NextResponse.json({
          reply: `✅ ${parsed.device} ${parsed.intent.replace("_", " ")}.`,
          meta: { ...parsed, python: res.data }
        });
      }
      return NextResponse.json({
        reply: `⚠️ Could not ${parsed.intent.replace("_", " ")} ${parsed.device}.`,
        meta: { ...parsed, error: res.error, details: res.details }
      }, { status: 400 });
    }

    // fallback: chit-chat or clarifying response
    const reply = await smalltalk(message);
    return NextResponse.json({ reply, meta: parsed });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
