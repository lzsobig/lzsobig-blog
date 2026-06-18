"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  getFeaturedArticles,
  formatDate,
  computeReadTime,
  Article,
} from "@/data/articles";
import { useBlogStore } from "@/store/blog-store";

/**
 * 3D rotating carousel of featured articles — preserved from LUMINA.
 * Cards arranged in a ring (perspective + rotateY), drag/swipe + autoplay.
 */
export default function FeaturedCarousel() {
  const featured = getFeaturedArticles();
  const openReader = useBlogStore((s) => s.openReader);

  const sceneRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currIndex, setCurrIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const indexRef = useRef(0);
  const autoplayRef = useRef(true);
  const dragData = useRef<{
    startX: number;
    active: boolean;
    moved: boolean;
  } | null>(null);

  const count = featured.length;
  const theta = 360 / count;

  useEffect(() => {
    indexRef.current = currIndex;
  }, [currIndex]);
  useEffect(() => {
    autoplayRef.current = autoplay;
  }, [autoplay]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const radius = isMobile ? 280 : 450;

  const rotate = useCallback(
    (dir: number) => {
      const next = (indexRef.current + dir + count) % count;
      indexRef.current = next;
      setCurrIndex(next);
      if (carouselRef.current) {
        const angle = -next * theta;
        carouselRef.current.style.transform = `translateZ(${-radius}px) rotateY(${angle}deg)`;
      }
    },
    [count, theta, radius]
  );

  // init position
  useEffect(() => {
    if (carouselRef.current) {
      const angle = -currIndex * theta;
      carouselRef.current.style.transform = `translateZ(${-radius}px) rotateY(${angle}deg)`;
    }
  }, [radius]);

  // autoplay
  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(() => {
      if (autoplayRef.current) rotate(1);
    }, 5000);
    return () => clearInterval(id);
  }, [autoplay, rotate]);

  // keyboard (homepage carousel nav) + drag
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (useBlogStore.getState().readerArticleId !== null) return;
      if (useBlogStore.getState().searchOpen) return;
      if (useBlogStore.getState().helpOpen) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        rotate(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        rotate(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rotate]);

  // drag / swipe
  const onPointerDown = (e: React.PointerEvent) => {
    dragData.current = {
      startX: e.clientX,
      active: true,
      moved: false,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragData.current?.active) return;
    const dx = e.clientX - dragData.current.startX;
    if (Math.abs(dx) > 8) dragData.current.moved = true;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragData.current?.active) return;
    const dx = e.clientX - dragData.current.startX;
    if (Math.abs(dx) > 50) {
      rotate(dx > 0 ? -1 : 1);
    }
    dragData.current.active = false;
  };

  const indicators = Array.from({ length: count });

  return (
    <section id="featured" className="py-20 md:py-28 relative">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <div
            className="text-sm font-semibold mb-3"
            style={{ color: "var(--accent)", letterSpacing: "0.1em" }}
          >
            精选文章
          </div>
          <h2
            className="font-black mb-3"
            style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
          >
            值得<span className="gradient-text-accent">深读</span>的几篇
          </h2>
          <p
            className="max-w-xl mx-auto"
            style={{ color: "var(--fg-muted)", fontSize: "14px" }}
          >
            拖动卡片或按 ← → 切换，点击卡片进入阅读模式。
          </p>
        </div>

        {/* 3D scene */}
        <div
          ref={sceneRef}
          className="scene"
          style={{
            width: "100%",
            height: isMobile ? "50vh" : "60vh",
            maxHeight: isMobile ? "420px" : "520px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            perspective: "1400px",
            position: "relative",
            overflow: "visible",
            touchAction: "pan-y",
          }}
          onMouseEnter={() => autoplayRef.current && setAutoplay(false)}
          onMouseLeave={() => setAutoplay(true)}
        >
          <div
            ref={carouselRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{
              position: "relative",
              width: isMobile ? "220px" : "300px",
              height: isMobile ? "300px" : "400px",
              transformStyle: "preserve-3d",
              transition: "transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)",
              cursor: "grab",
            }}
          >
            {featured.map((a, i) => {
              const angle = i * theta;
              const isActive = i === currIndex;
              return (
                <CarouselCard
                  key={a.id}
                  article={a}
                  angle={angle}
                  radius={radius}
                  isActive={isActive}
                  onClick={() => {
                    if (dragData.current?.moved) return;
                    if (!isActive) {
                      // rotate to this card
                      const dir =
                        (i - currIndex + count) % count <= count / 2 ? 1 : -1;
                      const steps =
                        Math.min(
                          (i - currIndex + count) % count,
                          (currIndex - i + count) % count
                        );
                      for (let s = 0; s < steps; s++) rotate(dir);
                    } else {
                      openReader(a.id);
                    }
                  }}
                />
              );
            })}
          </div>

          {/* Prev / Next buttons */}
          <button
            onClick={() => rotate(-1)}
            className="control-btn prev-btn"
            aria-label="上一张"
            style={{
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",
              left: isMobile ? "8px" : "calc(50% - 260px)",
              width: isMobile ? "40px" : "48px",
              height: isMobile ? "40px" : "48px",
              borderRadius: "50%",
              background: "var(--glass)",
              backdropFilter: "blur(12px)",
              border: "1px solid var(--border-strong)",
              color: "var(--fg)",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              zIndex: 50,
              transition: "all 0.3s ease",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={() => rotate(1)}
            aria-label="下一张"
            style={{
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",
              right: isMobile ? "8px" : "calc(50% - 260px)",
              width: isMobile ? "40px" : "48px",
              height: isMobile ? "40px" : "48px",
              borderRadius: "50%",
              background: "var(--glass)",
              backdropFilter: "blur(12px)",
              border: "1px solid var(--border-strong)",
              color: "var(--fg)",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              zIndex: 50,
              transition: "all 0.3s ease",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Indicators + autoplay toggle */}
        <div className="flex flex-col items-center gap-4 mt-8">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: "var(--glass)",
              border: "1px solid var(--border-strong)",
            }}
          >
            {indicators.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  const dir =
                    (i - currIndex + count) % count <= count / 2 ? 1 : -1;
                  const steps = Math.min(
                    (i - currIndex + count) % count,
                    (currIndex - i + count) % count
                  );
                  for (let s = 0; s < steps; s++) rotate(dir);
                }}
                aria-label={`第 ${i + 1} 张`}
                style={{
                  width: i === currIndex ? "24px" : "8px",
                  height: "8px",
                  borderRadius: "4px",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  background:
                    i === currIndex
                      ? "linear-gradient(90deg, var(--accent), var(--accent2))"
                      : "color-mix(in srgb, var(--fg) 25%, transparent)",
                }}
              />
            ))}
          </div>

          <button
            onClick={() => setAutoplay(!autoplay)}
            className="flex items-center gap-2 text-xs px-4 py-2 rounded-full btn-ghost"
            style={{ color: "var(--fg-soft)" }}
          >
            {autoplay ? (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
            {autoplay ? "暂停自动播放" : "自动播放"}
          </button>
        </div>
      </div>
    </section>
  );
}

function CarouselCard({
  article,
  angle,
  radius,
  isActive,
  onClick,
}: {
  article: Article;
  angle: number;
  radius: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={isActive ? "is-active" : ""}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        borderRadius: "24px",
        overflow: "hidden",
        background: "var(--glass)",
        backdropFilter: "blur(16px)",
        border: isActive
          ? "1px solid rgba(255,255,255,0.5)"
          : "1px solid var(--border-strong)",
        boxShadow: isActive
          ? "0 0 60px rgba(139,92,246,0.55), var(--shadow)"
          : "var(--shadow)",
        transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
        transformStyle: "preserve-3d",
        cursor: "pointer",
        transition: "box-shadow 0.4s ease, border-color 0.4s ease",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      <img
        src={article.img}
        alt={article.title}
        loading="lazy"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.85,
          transition: "transform 0.8s ease, opacity 0.4s ease",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 10,
          padding: "20px",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: article.color,
              boxShadow: `0 0 10px ${article.color}`,
            }}
          />
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "rgba(255,255,255,0.85)",
              letterSpacing: "0.04em",
            }}
          >
            {article.tagLabel}
          </span>
        </div>
        <h3
          style={{
            color: "#fff",
            fontWeight: 800,
            fontSize: "17px",
            lineHeight: 1.25,
            marginBottom: "6px",
          }}
        >
          {article.title}
        </h3>
        <p
          style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: "12px",
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.desc}
        </p>
        {isActive && (
          <div
            style={{
              marginTop: "10px",
              fontSize: "11px",
              color: "rgba(255,255,255,0.85)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>点击阅读</span>
            <span>→</span>
            <span style={{ marginLeft: "auto", opacity: 0.6 }}>
              {formatDate(article.date)} · {computeReadTime(article.body)}分钟
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
