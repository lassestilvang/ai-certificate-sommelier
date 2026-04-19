# 🍷 AI Certificate Sommelier

> *The world's most useless sommelier. We analyze your domain's SSL certificates and serve up absurdly snobby, AI-generated fine-wine reviews and custom bottle art.*

Built for the "Most Useless Hack" category. **AI Certificate Sommelier** takes the deeply unsexy world of SSL/TLS certificates and elevates it to an uncomfortable level of pretentious luxury. 

Enter a domain name, and the sommelier will natively pull its cryptographic certificate, analyze its "tannin profile" (SHA fingerprint string), assign it an arbitrary Vintage Score, and render a high-fidelity image of the "vintage" using Google's Nano Banana Pro model. Finally, the sommelier reads an elitist review of your encryption aloud, always ensuring to pair it with a terrible server-room snack.

## 🌟 The "Useless" Features

- **Cryptographic Degustation**: Natively extracts standard SSL details (RSA/ECC keys, Validities) and derives entirely meaningless metrics like "Vintage Score", physical "Legs", and literal CSS Hex "Color Hues" from the raw certificate bytes.
- **The Snobby Audio Review**: Powered by Gemini 3 Flash and ElevenLabs TTS, the app synthesizes a deeply pretentious spoken review. We enforce a prompt rule so the app always recommends a terrible food pairing (e.g. "pairs wonderfully with lukewarm Diet Coke").
- **Dynamic Nano Banana Art**: While the review is being read, the app triggers an asynchronous call to `gemini-3.1-flash-image-preview` (Nano Banana Pro), forcing it to dynamically paint an absurd bottle of wine sitting in a server rack. It injects the domain's actual Google Favicon, the generated hex color, and the fake vintage score directly onto the generated bottle.
- **The Spit Bucket**: Disgusted by a lightweight TLS 1.0 certificate? Hit the "Spit it out" button to aggressively halt playback and throw the certificate away.

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Bespoke Vanilla CSS (Vintage Paper & Dark Burgundy Theme)
- **Certificate Parsing**: Native Node.js `tls` module over Socket connections.
- **Text Generation**: Google Gemini via `@google/genai` (`gemini-3-flash-preview`).
- **Image Generation**: Google Gemini 3.1 Flash Image Preview (Nano Banana Pro).
- **Text-to-Speech**: ElevenLabs API (`eleven_turbo_v2_5`).

## 🚀 Getting Started

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables. Create a `.env.local` file in the root based on the following:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) with your browser. Enter a domain and wait for the sommelier to judge your encryption standards.
