import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { domain, vintageScore, colorHex, legs } = await request.json();

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }

    const ai = new GoogleGenAI({});
    
    const prompt = `A highly detailed, cinematic photograph of an old, dusty wine bottle sitting awkwardly inside a high-tech modern server rack. The wine bottle has a large, absurd paper label that explicitly reads the domain name: "${domain}". The liquid inside the bottle has a strange glowing color matching the hex code ${colorHex}. The bottle has a sticker that says "Vintage Score: ${vintageScore}" and "${legs}". Lighting is a mix of blinking blue server lights and a dramatic spotlight. Absurd, photorealistic, tech-humor.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: prompt,
    });

    let imageBase64 = "";
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        imageBase64 = part.inlineData.data;
        break;
      }
    }

    return NextResponse.json({ imageBase64 });
  } catch (error: any) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate image" }, 
      { status: 500 }
    );
  }
}
