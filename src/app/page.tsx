"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wine, Play, Square, Loader } from "lucide-react";
import WineLabel from "@/components/WineLabel";

export default function Home() {
  const [domain, setDomain] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  
  const [result, setResult] = useState<{
    certDetails: any;
    reviewText: string;
    audioBase64: string;
  } | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;

    setStatus("loading");
    setErrorMsg("");
    setResult(null);

    try {
      const res = await fetch("/api/sommelier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze domain");
      }

      setResult(data);
      setStatus("success");
      
      if (data.audioBase64) {
        // Auto-play the Audio
        setTimeout(() => {
          playAudio(`data:audio/mp3;base64,${data.audioBase64}`);
        }, 1000); // slight delay to let the UI settle
      }
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err.message);
    }
  };

  const playAudio = (src: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(src);
    audioRef.current = audio;
    
    audio.onended = () => setIsPlaying(false);
    audio.onplay = () => setIsPlaying(true);
    
    audio.play().catch(e => console.error("Audio playback failed", e));
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", padding: "2rem", alignItems: "center", position: "relative", zIndex: 10 }}>
      {/* Header section */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{ textAlign: "center", marginTop: "4rem", marginBottom: "3rem" }}
      >
        <Wine size={48} color="var(--wine-dark)" style={{ margin: "0 auto", marginBottom: "1rem" }} />
        <h1 style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>Sommelier AI</h1>
        <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--wine-red)", fontSize: "1.2rem" }}>
          A fine tasting of your cryptographic appellations.
        </p>
      </motion.div>

      {/* Input section */}
      <AnimatePresence>
        {status !== "success" && (
          <motion.div 
            style={{ width: "100%", maxWidth: "500px", margin: "0 auto" }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <form onSubmit={handleAnalyze} style={{ display: "flex", flexDirection: "column", gap: "2rem", alignItems: "center" }}>
              <input 
                type="text" 
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Enter a domain (e.g. google.com)"
                className="input-elegant"
                disabled={status === "loading"}
                autoComplete="off"
              />
              <button 
                type="submit" 
                className="button-wine" 
                disabled={status === "loading" || !domain.trim()}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                {status === "loading" ? (
                  <>
                    <Loader size={20} className="spin" /> Decoding Tannins...
                  </>
                ) : (
                  "Taste Certificate"
                )}
              </button>
            </form>

            {status === "error" && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ color: "var(--wine-red)", marginTop: "2rem", textAlign: "center", fontFamily: "var(--font-mono)" }}
              >
                [Error: {errorMsg}]
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Section */}
      <AnimatePresence>
        {status === "success" && result && (
          <motion.div 
            style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <WineLabel certDetails={result.certDetails} />

            <motion.div 
              style={{ 
                marginTop: "3rem", 
                padding: "2rem", 
                borderTop: "1px solid var(--gold-dark)",
                borderBottom: "1px solid var(--gold-dark)",
                textAlign: "center"
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1.5 }}
            >
              <h3 style={{ fontFamily: "var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "0.8rem", marginBottom: "1rem", opacity: 0.6 }}>The Review</h3>
              <p style={{ 
                fontFamily: "var(--font-serif)", 
                fontSize: "1.5rem", 
                lineHeight: "1.6",
                color: "var(--ink-color)",
                maxWidth: "600px",
                margin: "0 auto"
              }}>
                "{result.reviewText}"
              </p>

              {result.audioBase64 && (
                <div style={{ marginTop: "2rem", display: "flex", justifyContent: "center" }}>
                  <button 
                    onClick={togglePlayback}
                    style={{ 
                      background: "transparent", 
                      border: "1px solid var(--wine-dark)", 
                      borderRadius: "50%",
                      width: "50px", height: "50px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "var(--wine-dark)",
                      cursor: "pointer",
                      transition: "all 0.3s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--wine-dark)";
                      e.currentTarget.style.color = "var(--paper-bg)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--wine-dark)";
                    }}
                  >
                    {isPlaying ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" style={{ marginLeft: "4px" }} />}
                  </button>
                </div>
              )}
            </motion.div>

            <div style={{ textAlign: "center", marginTop: "3rem" }}>
              <button 
                onClick={() => {
                  setStatus("idle");
                  setDomain("");
                  if (audioRef.current) {
                    audioRef.current.pause();
                    setIsPlaying(false);
                  }
                }}
                className="button-wine"
                style={{ fontSize: "0.9rem", padding: "8px 16px" }}
              >
                Taste Another Vintage
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .spin {
          animation: spin 2s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
