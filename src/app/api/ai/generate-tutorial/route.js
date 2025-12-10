import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.Z_AI_API_KEY;
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

    const systemPrompt = `You are an expert technical tutorial writer. Your task is to generate a complete mini tutorial structure based on the user's prompt.

You MUST respond with ONLY a valid JSON object (no markdown, no explanation, no code fences). The JSON structure must be:

{
  "title": "Tutorial title",
  "description": "A brief 1-2 sentence description of what this tutorial covers",
  "category": "Category name (e.g., React, Next.js, DevOps, CSS, JavaScript)",
  "difficulty": "beginner" or "intermediate" or "advanced",
  "estimated_time": "X min" (estimate reading/completion time),
  "steps": [
    {
      "title": "Step title",
      "content": "Step content in Markdown format. Include code blocks with proper language identifiers. Be detailed and helpful."
    }
  ]
}

Rules:
1. Generate 3-6 steps depending on complexity.
2. Each step content should be 100-300 words with proper Markdown formatting.
3. Include code examples where appropriate.
4. Make the tutorial practical and actionable.
5. Use Indonesian language for all text content.
6. Return ONLY the JSON object, nothing else.`;

    const completion = await client.chat.completions.create({
      model: "glm-4.6",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Buatkan tutorial lengkap tentang: ${prompt}` }
      ],
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content || '';

    // Try to parse the JSON response
    let tutorialData;
    try {
      // Clean up potential markdown code fences
      let cleanedResponse = responseText.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.slice(7);
      }
      if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.slice(3);
      }
      if (cleanedResponse.endsWith('```')) {
        cleanedResponse = cleanedResponse.slice(0, -3);
      }

      tutorialData = JSON.parse(cleanedResponse.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      return NextResponse.json(
        { error: 'AI returned invalid format', details: 'Could not parse tutorial structure' },
        { status: 500 }
      );
    }

    // Validate required fields
    if (!tutorialData.title || !tutorialData.steps || !Array.isArray(tutorialData.steps)) {
      return NextResponse.json(
        { error: 'AI returned incomplete tutorial structure' },
        { status: 500 }
      );
    }

    return NextResponse.json(tutorialData);

  } catch (error) {
    console.error('AI Tutorial Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate tutorial', details: error.message },
      { status: 500 }
    );
  }
}
