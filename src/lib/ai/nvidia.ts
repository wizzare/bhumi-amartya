import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1",
});

export async function askNvidia(prompt: string) {
  const response = await client.chat.completions.create({
    model: process.env.NVIDIA_MODEL || "meta/llama-3.3-70b-instruct",
    messages: [
      {
        role: "system",
        content:
          "Kamu adalah Bhumi, mentor reflektif yang hangat, membumi, spiritual tapi tetap praktis.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 900,
  });

  return response.choices[0]?.message?.content || "";
}