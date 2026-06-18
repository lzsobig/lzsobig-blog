"use client";

import { useEffect, useRef, useState } from "react";
import { useBlogStore } from "@/store/blog-store";

/* ===== Custom Cursor ===== */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const readerArticleId = useBlogStore((s) => s.readerArticleId);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let mx = -100,
      my = -100;
    let rx = -100,
      ry = -100;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.left = mx + "px";
        dotRef.current.style.top = my + "px";
      }
    };

    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.left = rx + "px";
        ringRef.current.style.top = ry + "px";
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (
        t.closest(
          "a, button, .article-card, .tag-chip, .nav-link, [role='button'], input, textarea, .card"
        )
      ) {
        ringRef.current?.classList.add("cursor-hover");
      }
    };
    const onOut = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (
        t.closest(
          "a, button, .article-card, .tag-chip, .nav-link, [role='button'], input, textarea, .card"
        )
      ) {
        ringRef.current?.classList.remove("cursor-hover");
      }
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, []);

  // Hide when reader open
  if (readerArticleId !== null) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}

/* ===== Particles ===== */
export function Particles() {
  const [particles, setParticles] = useState<
    {
      left: number;
      top: number;
      size: number;
      delay: number;
      duration: number;
      color: string;
      opacity: number;
    }[]
  >([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // defer to next tick to avoid synchronous setState in effect body
    const id = setTimeout(() => {
      setParticles(
        Array.from({ length: 28 }, () => ({
          left: Math.random() * 100,
          top: Math.random() * 100,
          size: Math.random() * 4 + 1,
          delay: Math.random() * 14,
          duration: Math.random() * 8 + 10,
          color: Math.random() < 0.5 ? "#8b5cf6" : "#ec4899",
          opacity: Math.random() * 0.4 + 0.1,
        }))
      );
    }, 0);
    return () => clearTimeout(id);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {particles.map((p, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ===== Reading Progress Bar ===== */
export function ProgressBar() {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setWidth(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div id="progress-bar" style={{ width: `${width}%` }} />;
}

/* ===== Back to Top ===== */
export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      className="back-to-top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="回到顶部"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
    </button>
  );
}

/* ===== Toast ===== */
export function ToastHost() {
  const toast = useBlogStore((s) => s.toast);
  if (!toast) return null;

  const icons: Record<string, string> = {
    check: "✓",
    envelope: "✉",
    share: "🔗",
    bookmark: "🔖",
    "bookmark-off": "💔",
    play: "▶",
    pause: "⏸",
  };

  return (
    <div className="toast">
      <span style={{ color: "var(--accent)" }}>{icons[toast.icon] || "✓"}</span>
      <span>{toast.msg}</span>
    </div>
  );
}
