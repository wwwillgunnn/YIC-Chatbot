// Run this API route on the edge runtime (faster, closer to users)
export const runtime = "edge"; 

import { NextResponse } from "next/server";
import Groq from "groq-sdk";

// Initialize Groq client with API key from environment variables
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Map of device names to their internal IDs in the YIC system
const devices: Record<string, string> = {
  lights: "3101",
  front_sprinklers: "4101",
  back_sprinklers: "4102",
  security_cameras: "5101",
  alarm: "6101",
};

/**
 * Detects the user's intent from a natural language message.
 * Uses Groq LLM to classify commands into:
 *   - Single device control (lights, sprinklers, etc.)
 *   - Multi-device scenarios (intruder, weather_alert, system_check)
 * Returns a structured JSON object describing the action.
 */
async function detectIntent(
  message: string
): Promise<{ intent: string; deviceId?: string; action?: string; duration?: number }> {
  // Instruction context for the LLM to follow strictly
  const context = `
You are an intent + scenario classifier. 
Devices: 
- lights: "3101"
- front_sprinklers: "4101"
- back_sprinklers: "4102"
- security_cameras: "5101"
- alarm: "6101"

Actions:
- "on", "off"
- For sprinklers: support "on <minutes>" (example: "on 15" = run for 15 minutes)

Scenarios:
- "intruder" → turn on lights + activate alarm + start recording with security cameras.
- "weather_alert" → turn off sprinklers, turn off lights.
- "system_check" → return action 'check'.

Rules:
- Always return a JSON object like: 
  { "intent": string, "deviceId"?: string, "action"?: string, "duration"?: number }
- Keep responses strictly machine-readable JSON. 
- If no match, respond with { "intent": "none" }.
`;

  // Build the chat prompt for Groq
  const prompt = [
    { role: "system", content: context },
    { role: "user", content: message },
  ] as Groq.Chat.Completions.ChatCompletionMessageParam[];

  // Ask Groq LLM to classify the message
  const completion = await groq.chat.completions.create({
    model: "llama3-8b-8192",
    messages: prompt,
  });

  // Parse JSON response safely
  try {
    return JSON.parse(completion.choices[0]?.message?.content ?? "{}");
  } catch {
    return { intent: "none" }; // fallback if parsing fails
  }
}

/**
 * Handles POST requests to /api/chat
 * Expects a { message } in the body.
 * 1. Detects intent using detectIntent()
 * 2. Runs multi-device scenarios (intruder, weather_alert, system_check)
 * 3. Runs single-device actions (on/off with optional duration)
 * 4. Falls back to general AI chatbot if no intent is found
 */
export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const intentData = await detectIntent(message);

    // --- Handle multi-device scenarios ---
    if (intentData.intent === "intruder") {
      const actions = [
        { device: "lights", id: devices.lights, action: "on" },
        { device: "alarm", id: devices.alarm, action: "on" },
        { device: "security_cameras", id: devices.security_cameras, action: "on" },
      ];
      return NextResponse.json({
        reply: "🚨 Intruder detected. Turning on lights, alarm, and cameras.",
        actions,
      });
    }

    if (intentData.intent === "weather_alert") {
      const actions = [
        { device: "lights", id: devices.lights, action: "off" },
        { device: "front_sprinklers", id: devices.front_sprinklers, action: "off" },
        { device: "back_sprinklers", id: devices.back_sprinklers, action: "off" },
      ];
      return NextResponse.json({
        reply: "⚠️ Weather alert. Turning off lights and sprinklers.",
        actions,
      });
    }

    if (intentData.intent === "system_check") {
      return NextResponse.json({ reply: "🔍 Systems nominal" });
    }

    // --- Handle single-device commands ---
    if (intentData.deviceId && intentData.action) {
      // Find human-readable name of the device
      const deviceName = Object.keys(devices).find(
        (key) => devices[key] === intentData.deviceId
      );

      // Build response message
      let reply = `✅ ${intentData.action === "on" ? "Turning on" : "Turning off"} ${deviceName?.replace("_", " ")}`;

      // Add duration if specified (for sprinklers, etc.)
      if (intentData.duration) {
        reply += ` for ${intentData.duration} minutes`;
      }

      return NextResponse.json({
        reply,
        device: intentData.deviceId,
        action: intentData.action,
        duration: intentData.duration ?? null,
      });
    }

    // --- Fallback chatbot (no intent detected) ---
    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        { role: "system", content: "You are a short-response, helpful assistant." },
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0]?.message?.content || "…";
    return NextResponse.json({ reply });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}




// ! Old working implementation !
// import { NextResponse } from "next/server";
// import Groq from "groq-sdk";
// import { execFile } from "child_process";
// import path from "path";

// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// function runPythonScript(): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const scriptPath = path.resolve("./src/services/YICTEST.py");
//     execFile("python3", [scriptPath], (error, stdout, stderr) => {
//       if (error) {
//         console.error("Python script error:", error);
//         return reject(error);
//       }
//       if (stderr) {
//         console.error("Python script stderr:", stderr);
//       }
//       resolve(stdout.trim());
//     });
//   });
// }

// async function detectIntent(message: string): Promise<"turn_on" | "turn_off" | "none"> {

//   const prompt = [
//     {
//       role: "system",
//       content:
//         "You are an intent classifier. Only reply with one of these exact strings: 'turn_on', 'turn_off', or 'none'.",
//     },
//     {
//       role: "user",
//       content: `Classify the intent of this message: "${message}"`,
//     },
//   ]as Groq.Chat.Completions.ChatCompletionMessageParam[];

  

//   const completion = await groq.chat.completions.create({
//     model: "llama3-8b-8192",
//     messages: prompt,
//   });

// const firstChoice = completion.choices[0];

// const intent = completion.choices[0]?.message?.content?.trim().toLowerCase() ?? "none";



//   if (intent === "turn_on") return "turn_on";
//   if (intent === "turn_off") return "turn_off";
//   return "none";
// }

// export async function POST(req: Request) {
//   try {
//     const { message } = await req.json();

//     const intent = await detectIntent(message);

//     if (intent === "turn_on") {
//       const pythonOutput = await runPythonScript();
//       return NextResponse.json({
//         reply: `✅ Lights turned on! (Python says: ${pythonOutput})`,
//       });
//     }

//     if (intent === "turn_off") {
//       const pythonOutput = await runPythonScript();
//       return NextResponse.json({
//         reply: `✅ Lights turned off! (Python says: ${pythonOutput})`,
//       });
//     }

//     // If no intent matched, fallback to chat model response
//     const completion = await groq.chat.completions.create({
//       model: "llama3-8b-8192",
//       messages: [
//         { role: "system", content: "You are a friendly, helpful chatbot." },
//         { role: "user", content: message },
//       ],
//     });

//     const reply = completion.choices[0]?.message?.content || "Hmm, I’m lost for words.";

//     return NextResponse.json({ reply });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
//   }
// }
