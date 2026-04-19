import { NextResponse } from "next/server";
import tls from "tls";
import { GoogleGenAI } from "@google/genai";

// Vercel Serverless Function (Node.js runtime is default, which we need for 'tls')
export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60 seconds max

// ElevenLabs Voice ID for "Deep Male Wine Connoisseur" (George - snobby british / deep)
// Alternatively, "pNInz6obpgDQGcFmaJgB" for Adam
const VOICE_ID = "JBFqnCBcs6RbLxPeqDZH";

async function getCertificate(domain: string): Promise<any> {
  return new Promise((resolve, reject) => {
    // Strip http/https and paths if user blindly pasted a URL
    let hostname = domain;
    try {
        if (domain.startsWith("http")) {
            const url = new URL(domain);
            hostname = url.hostname;
        }
    } catch(e) {}

    const socket = tls.connect(
      {
        host: hostname,
        port: 443,
        servername: hostname, // SNI support
        rejectUnauthorized: false, // We still want to see the cert even if it's technically invalid
      },
      () => {
        const cert = socket.getPeerCertificate(true);
        socket.end();
        if (!cert || Object.keys(cert).length === 0) {
          reject(new Error("No certificate found for this domain."));
        } else {
          resolve(cert);
        }
      }
    );

    socket.on("error", (err) => {
      reject(err);
    });
    
    // Timeout after 8 seconds
    socket.setTimeout(8000, () => {
      socket.destroy();
      reject(new Error("Connection timed out"));
    });
  });
}

export async function POST(request: Request) {
  try {
    const { domain } = await request.json();

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }

    // 1. Fetch TLS Certificate
    const cert = await getCertificate(domain);
    
    const validFrom = new Date(cert.valid_from).toISOString().split('T')[0];
    const validTo = new Date(cert.valid_to).toISOString().split('T')[0];
    const issuer = cert.issuer?.O || cert.issuer?.CN || "Unknown Vineyards";
    const subject = cert.subject?.CN || domain;
    
    // Days until expiration
    const expiryTime = new Date(cert.valid_to).getTime();
    const daysUntilExpiry = Math.ceil((expiryTime - Date.now()) / (1000 * 60 * 60 * 24));
    
    const certDetailsStr = `
Domain: ${subject}
Issuer (Vineyard): ${issuer}
Algorithm: ${cert.infoAccess ? "RSA/ECC" : "Unknown"} 
Fingerprint (Tannins effect): ${cert.fingerprint256}
Valid From: ${validFrom}
Expires in: ${daysUntilExpiry} days
    `;

    // 2. Generate Sommelier Review using Gemini
    const ai = new GoogleGenAI({});
    
    const prompt = `
You are an absurdly elitist, sophisticated, and somewhat dramatic wine sommelier. 
However, you do not review wine. You review SSL/TLS certificates for websites.

Write a very short (max 2-3 sentences) spoken review of the following SSL certificate as if it were a fine vintage. 
Mention its cryptography (RSA, SHA-256, etc) as if they were flavor notes (like oak, tannins, blackberry). 
Comment on its expiration date (e.g. "needs to breathe", or "drink now before it expires in X days").
Keep it punchy, incredibly snobby but humorous.

Certificate Data:
${certDetailsStr}

Respond ONLY with the spoken review text, no quotes or additional formatting.
`;

    const geminiResponse = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // High capability model
      contents: prompt,
    });

    const reviewText = geminiResponse.text?.trim() || "Ah, a peculiar vintage. I cannot quite place the notes.";

    // 3. Generate Audio using ElevenLabs
    let audioBase64 = "";
    if (process.env.ELEVENLABS_API_KEY) {
      try {
        const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": process.env.ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text: reviewText,
            model_id: "eleven_monolingual_v1",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75
            }
          })
        });

        if (ttsResponse.ok) {
          const arrayBuffer = await ttsResponse.arrayBuffer();
          audioBase64 = Buffer.from(arrayBuffer).toString('base64');
        } else {
          console.error("ElevenLabs API error:", await ttsResponse.text());
        }
      } catch (e) {
        console.error("Failed to generate audio", e);
      }
    }

    return NextResponse.json({
      certDetails: {
        domain: subject,
        issuer,
        validFrom,
        validTo,
        daysUntilExpiry,
        fingerprint: cert.fingerprint256?.substring(0, 16) + '...',
      },
      reviewText,
      audioBase64,
    });

  } catch (error: any) {
    console.error("Sommelier error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze certificate" }, 
      { status: 500 }
    );
  }
}
