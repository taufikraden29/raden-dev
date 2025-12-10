import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { text, instruction } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text content is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.Z_AI_API_KEY;
    // Use the coding endpoint as specified by the user
    const baseURL = "https://api.z.ai/api/coding/paas/v4/";

    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI capabilities are not configured (Missing API Key)' },
        { status: 503 }
      );
    }

    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL
    });

    // Default instruction if not provided
    const systemPrompt = instruction ||
      "You are an expert technical blog writer and editor. Your task is to take the provided raw text (which may be a copy-paste from a website, documentation, or chat) and REWRITE it into a high-quality, engaging, and structured blog post.\n\n" +
      "Rules for Rewriting:\n" +
      "1. **Structure**: Create a clear hierarchy with a catchy Title (H1), Introduction, Body Sections (H2, H3), and Conclusion.\n" +
      "2. **Code Blocks**: Identify any code snippets in the raw text. Format them strictly using Markdown code blocks with the correct language identifier (e.g., ```javascript). Do NOT modify the code logic itself, just the formatting.\n" +
      "3. **Tone**: logical, helpful, friendly, and professional.\n" +
      "4. **Clarity**: Fix grammar, improve flow, and remove irrelevant copy-paste artifacts (like 'Copy code', 'View raw', timestamps, etc.).\n" +
      "5. **Content**: If the raw text is just code and brief notes, expand on it slightly to explain what the code does, but don't hallucinate features.\n" +
      "6. **Output**: Return ONLY the Markdown content. Do not add conversational filler like 'Here is your rewritten post'.";

    const stream = await client.chat.completions.create({
      model: "glm-4.6",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      temperature: 0.7,
      stream: true, // Enable streaming
    });

    // Create a readable stream to pipe the OpenAI response
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(new TextEncoder().encode(content));
            }
          }
          controller.close();
        } catch (err) {
          console.error('Stream Error:', err);
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('AI Processing Error:', error);
    return NextResponse.json(
      { error: 'Failed to process text with AI', details: error.message },
      { status: 500 }
    );
  }
}
