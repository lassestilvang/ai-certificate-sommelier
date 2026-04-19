import React from "react";
import styles from "./WineLabel.module.css";
import { motion } from "framer-motion";

interface WineLabelProps {
  certDetails: {
    domain: string;
    issuer: string;
    validFrom: string;
    validTo: string;
    daysUntilExpiry: number;
    fingerprint: string;
    vintageScore: number;
    colorHex: string;
    legs: string;
  };
}

export default function WineLabel({ certDetails }: WineLabelProps) {
  return (
    <motion.div 
      className={styles.labelContainer}
      initial={{ opacity: 0, y: 20, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className={styles.innerBorder}>
        <div className={styles.vineyard}>Certificated by</div>
        <div className={styles.vintage}>{certDetails.issuer}</div>
        
        <div className={styles.domain}>{certDetails.domain}</div>
        
        <div className={styles.divider} />
        
        <div className={styles.statsRow}>
          <span className={styles.statsLabel}>Bottled (Valid From):</span>
          <span className={styles.statsValue}>{certDetails.validFrom}</span>
        </div>
        
        <div className={styles.statsRow}>
          <span className={styles.statsLabel}>Expires:</span>
          <span className={styles.statsValue}>{certDetails.daysUntilExpiry} Days</span>
        </div>
        
        <div className={styles.statsRow}>
          <span className={styles.statsLabel}>Tannin Profile (Fingerprint):</span>
          <span className={styles.statsValue}>{certDetails.fingerprint}</span>
        </div>

        <div className={styles.divider} />
        
        <div className={styles.statsRow}>
          <span className={styles.statsLabel}>Vintage Score (Arbitrary):</span>
          <span className={styles.statsValue}>{certDetails.vintageScore} / 100 pts</span>
        </div>

        <div className={styles.statsRow} style={{ alignItems: "center" }}>
          <span className={styles.statsLabel}>Hue & Clarity:</span>
          <span style={{ 
            display: "inline-block", 
            width: "16px", height: "16px", 
            borderRadius: "50%", 
            background: certDetails.colorHex,
            border: "1px solid var(--gold-dark)"
          }}></span>
        </div>

        <div className={styles.statsRow}>
          <span className={styles.statsLabel}>Legs:</span>
          <span className={styles.statsValue}>{certDetails.legs}</span>
        </div>

        <div className={styles.stamp}>
          {certDetails.vintageScore > 90 ? "Fine" : "Corked"}
        </div>
      </div>
    </motion.div>
  );
}
