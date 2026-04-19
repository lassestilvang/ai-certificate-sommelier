"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wine, Play, Square, Loader } from "lucide-react";
import Image from "next/image";
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

  const [generatedImageBase64, setGeneratedImageBase64] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;

    setStatus("loading");
    setErrorMsg("");
    setResult(null);
    setGeneratedImageBase64(null);

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

      setIsGeneratingImage(true);
      fetch("/api/sommelier/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: data.certDetails.domain,
          vintageScore: data.certDetails.vintageScore,
          colorHex: data.certDetails.colorHex,
          legs: data.certDetails.legs
        }),
      }).then(res => res.json()).then(imgData => {
        if (imgData.imageBase64) setGeneratedImageBase64(imgData.imageBase64);
      }).catch(console.error).finally(() => setIsGeneratingImage(false));
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
        <Image src="/logo.png" alt="Wine" width={80} height={80} style={{ margin: "0 auto", marginBottom: "1rem", borderRadius: "50%", boxShadow: "0 4px 15px rgba(0,0,0,0.5)", border: "2px solid var(--gold-accent)" }} priority />
        <h1 style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>AI Certificate Sommelier</h1>
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

            <motion.div
              style={{ marginTop: "2rem", textAlign: "center", minHeight: "300px", display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {isGeneratingImage && !generatedImageBase64 ? (
                <div style={{ color: "var(--wine-dark)", opacity: 0.7, fontStyle: "italic", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Loader size={18} className="spin" /> Nanobanana Pro is painting the vintage...
                </div>
              ) : generatedImageBase64 ? (
                <img
                  src={`data:image/jpeg;base64,${generatedImageBase64}`}
                  alt="Generated Certificate Bottle"
                  style={{ maxWidth: "100%", maxHeight: "500px", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", border: `4px solid ${result.certDetails.colorHex}`, cursor: "zoom-in" }}
                  onClick={() => setIsImageModalOpen(true)}
                />
              ) : null}
            </motion.div>

            <div style={{ textAlign: "center", marginTop: "3rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
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

              <button
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.pause();
                    setIsPlaying(false);
                  }
                  alert("Absolutely corked. You violently spit out the certificate tasting.");
                  setStatus("idle");
                  setDomain("");
                }}
                className="button-wine"
                style={{ fontSize: "0.9rem", padding: "8px 16px", background: "transparent", color: "var(--wine-dark)" }}
              >
                Spit it out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isImageModalOpen && generatedImageBase64 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsImageModalOpen(false)}
            style={{
              position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
              backgroundColor: "rgba(0,0,0,0.85)", zIndex: 100, display: "flex",
              alignItems: "center", justifyContent: "center", padding: "2rem",
              cursor: "zoom-out"
            }}
          >
            <motion.img 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={`data:image/jpeg;base64,${generatedImageBase64}`}
              alt="Generated Certificate Bottle (Full Size)"
              style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: "8px", boxShadow: "0 20px 50px rgba(0,0,0,0.9)" }}
            />
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
