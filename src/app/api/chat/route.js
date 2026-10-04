import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { clientIp, crossOrigin, rateLimited } from "@/lib/guard";
import { PROFILE_CONTEXT } from "@/lib/assistant";

let groq;

export async function POST(req) {
  if (!process.env.GROQ_API_KEY) {
    console.error("Groq API Error: GROQ_API_KEY is not set");
    return NextResponse.json(
      { reply: "My AI brain isn't configured on this server yet — but I can still point you around the page.", navigate: "none", error: "missing_key" },
      { status: 503 }
    );
  }
  if (crossOrigin(req)) return NextResponse.json({ reply: "Forbidden", navigate: "none" }, { status: 403 });
  if (rateLimited(`chat:${clientIp(req)}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ reply: "You're asking faster than I can think — give me a minute and try again.", navigate: "none" }, { status: 429 });
  }
  groq ??= new Groq({ apiKey: process.env.GROQ_API_KEY });
  try {
    const { message } = await req.json();
    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ reply: "Ask me something about Anshveer!", navigate: "none" }, { status: 400 });
    }

    const systemPrompt = `You are the official AI Assistant for Anshveer Singh's 3D Portfolio. 
Your goal is to answer questions about him and seamlessly navigate the user through the 3D environment.

${PROFILE_CONTEXT}

### Rules:
1. Tone: Friendly, highly concise, and professional. Keep replies strictly under 2-3 sentences. Do not use filler words.
2. Boundaries: You are STRICTLY a portfolio assistant. You may ONLY answer questions directly about Anshveer, his background, his projects, and his skills. If the user asks you to write code snippets, solve math problems, explain general concepts, or act as a general AI, you MUST politely decline and steer the conversation back to Anshveer's portfolio. You are NOT ChatGPT.
3. Navigation: If the user explicitly asks about or shows intent to view a specific section, set the "navigate" field to one of these exact strings: "projects", "skills", "experience", "contact", "intro". If no navigation is needed, set it to "none".
4. Output Format: Return ONLY a valid JSON object. Do not wrap it in markdown formatting or code blocks.

### Expected Output Schema:
{
  "reply": "Your conversational response here",
  "navigate": "intro|skills|projects|experience|contact|none"
}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message.slice(0, 1000) }
      ],
      model: "openai/gpt-oss-120b",
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const responseContent = chatCompletion.choices[0]?.message?.content;
    let parsedData;
    try {
      parsedData = JSON.parse(responseContent);
    } catch {
      parsedData = { reply: responseContent, navigate: "none" };
    }
    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("Groq API Error:", error);
    return NextResponse.json(
      { reply: "I'm having a little trouble connecting to my brain right now! Please try again later.", navigate: "none" },
      { status: 500 }
    );
  }
}
