import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const apiKey = searchParams.get("key");

  if (!apiKey) {
    return NextResponse.json({ status: "error", message: "No API key provided" }, { status: 400 });
  }

  try {
    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Hello, are you working?" }],
      model: "llama-3.3-70b-versatile",
    });

    return NextResponse.json({ status: "ok", response: completion.choices[0]?.message?.content });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message, details: error },
      { status: 500 }
    );
  }
}
