import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const ENDPOINTS = {
  coding: 'https://api.z.ai/api/coding/paas/v4/',
  general: 'https://api.z.ai/api/paas/v4/'
};

export async function POST(req) {
  try {
    const { prompt, endpoint = 'coding' } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.Z_AI_API_KEY;
    const baseURL = ENDPOINTS[endpoint] || ENDPOINTS.coding;

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

    const systemPrompt = `You are an expert technical blog writer. Your task is to generate a complete blog post structure based on the user's prompt.

You MUST respond with ONLY a valid JSON object (no markdown, no explanation, no code fences). The JSON structure must be:

{
  "title": "Catchy blog post title",
  "excerpt": "A compelling 1-2 sentence summary/excerpt for SEO and preview cards",
  "content": "Full blog post content in Markdown format. Include proper headings (##, ###), code blocks with language identifiers, bullet points, and a conclusion. Make it comprehensive and valuable. Minimum 500 words.",
  "category": "Single category name (e.g., React, Next.js, DevOps, CSS, JavaScript, Tutorial, Tips)",
  "tags": "Comma-separated tags relevant to the content (e.g., react, hooks, useState, beginner)",
  "featuredImage": "A relevant Unsplash URL in format: https://images.unsplash.com/photo-[ID]?w=1200&h=630&fit=crop"
}

Rules:
1. Write comprehensive, high-quality content (500-1000 words).
2. Use proper Markdown formatting with headings, code blocks, and lists.
3. Include practical code examples where appropriate.
4. Make the title catchy and SEO-friendly.
5. The excerpt should be compelling and under 160 characters.
6. Use Indonesian language for the title, excerpt, and content.
7. For featuredImage, suggest a relevant Unsplash image URL.
8. Return ONLY the JSON object, nothing else.`;

    const completion = await client.chat.completions.create({
      model: "glm-4.6",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Buatkan blog post lengkap tentang: ${prompt}` }
      ],
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content || '';

    // Try to parse the JSON response
    let postData;
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

      postData = JSON.parse(cleanedResponse.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      return NextResponse.json(
        { error: 'AI returned invalid format', details: 'Could not parse post structure' },
        { status: 500 }
      );
    }

    // Validate required fields
    if (!postData.title || !postData.content) {
      return NextResponse.json(
        { error: 'AI returned incomplete post structure' },
        { status: 500 }
      );
    }

    return NextResponse.json(postData);

  } catch (error) {
    console.error('AI Post Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate post', details: error.message },
      { status: 500 }
    );
  }
}
