"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { getUserIdFromToken } from "@/lib/auth";
import styles from "../social.module.css";

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitPop, setSubmitPop] = useState(false);
  
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const currentUserId = getUserIdFromToken();
    if (!currentUserId) {
      alert("Błąd autoryzacji. Zaloguj się ponownie.");
      return;
    }

    // Odpalamy gwarantowaną animację wciśnięcia
    setSubmitPop(true);
    setTimeout(() => setSubmitPop(false), 300);

    setIsSubmitting(true);

    try {
      await api.post("/api/social/posts/", {
        content: content,
        workout_session: null,
        group: null
      });

      setContent(""); 
      window.dispatchEvent(new Event("refreshFeed")); 
    } catch (error) {
      console.error("Błąd podczas dodawania posta:", error);
      alert("Nie udało się opublikować posta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.card}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Co dzisiaj trenowałeś?"
          className={styles.textarea}
          rows={3}
          disabled={isSubmitting}
        />
        
        <div className={styles.buttonRow}>
          <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} disabled={isSubmitting}>
            + Dodaj Trening
          </button>

          <button 
            type="submit" 
            className={`${styles.btn} ${styles.btnPrimary} ${submitPop ? styles.animSquish : ""}`}
            disabled={!isMounted || !content.trim() || isSubmitting}
          >
            Opublikuj
          </button>
        </div>
      </form>
    </div>
  );
}