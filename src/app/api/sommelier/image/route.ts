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
    
    // Fetch favicon for the domain
    let faviconParts: any[] = [];
    try {
      const faviconRes = await fetch(`https://www.google.com/s2/favicons?domain=${domain}&sz=256`);
      if (faviconRes.ok) {
        const arrayBuffer = await faviconRes.arrayBuffer();
        faviconParts.push({
          inlineData: {
            mimeType: "image/png", // Google favicons API usually returns PNG for high-res
            data: Buffer.from(arrayBuffer).toString("base64")
          }
        });
      }
    } catch(e) {
      console.warn("Could not fetch favicon: ", e);
    }

    const prompt = `A highly detailed, cinematic photograph of an old, dusty wine bottle sitting awkwardly inside a high-tech modern server rack. The wine bottle has a large, absurd paper label that explicitly reads the domain name: "${domain}". If an image is provided alongside this text, perfectly integrate that icon/logo into the graphic design of the bottle's label. The liquid inside the bottle has a strange glowing color matching the hex code ${colorHex}. The bottle has a sticker that says "Vintage Score: ${vintageScore}" and "${legs}". Lighting is a mix of blinking blue server lights and a dramatic spotlight. Absurd, photorealistic, tech-humor.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: [
        { text: prompt },
        ...faviconParts
      ],
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
