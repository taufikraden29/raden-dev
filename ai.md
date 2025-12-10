API KEY Z AI = 250e060384f5497b89d83d5475da7683.JhrShi5ohQkNqUq4

END POINT
Coding endpoint - https://api.z.ai/api/coding/paas/v4
instead of the general endpoint - https://api.z.ai/api/paas/v4

CAll Example
import OpenAI from "openai";

const client = new OpenAI({
    apiKey: "your-Z.AI-api-key",
    baseURL: "https://api.z.ai/api/paas/v4/"
});

async function main() {
    const completion = await client.chat.completions.create({
        model: "glm-4.6",
        messages: [
            { role: "system", content: "You are a helpful AI assistant." },
            { role: "user", content: "Hello, please introduce yourself." }
        ]
    });

    console.log(completion.choices[0].message.content);
}

main();