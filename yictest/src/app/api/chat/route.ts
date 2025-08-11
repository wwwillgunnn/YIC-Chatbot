export const runtime = 'edge';

import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import OpenAI from "openai";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY, // set this in .env.local
// });

// export async function POST(req: Request) {
//   try {
//     const { message } = await req.json();

//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o-mini", // you can use "gpt-3.5-turbo" too
//       messages: [
//         { role: "system", content: "You are a helpful assistant." },
//         { role: "user", content: message },
//       ],
//     });

//     const reply = completion.choices[0]?.message?.content || "Sorry, I couldn't think of anything.";

//     return NextResponse.json({ reply });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
//   }
// }

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, // store in .env.local
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192", // free and fast model
      messages: [
        { role: "system", content: "You are a friendly, helpful chatbot." },
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0]?.message?.content || "Hmm, I’m lost for words.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
