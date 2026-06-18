"use client";

import { useEffect, useRef, useState } from "react";
import { getFeaturedArticles, formatDate, computeReadTime } from "@/data/articles";

interface PortalHeroProps {
  onEnterBlog: () => void;
}

export default function PortalHero({ onEnterBlog }: PortalHeroProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const nebulaRef = useRef<HTMLDivElement>(null);
  const curtainLRef = useRef<HTMLDivElement>(null);
  const curtainRRef = useRef<HTMLDivElement>(null);
  const scene1Ref = useRef<HTMLDivElement>(null);
  const scene2Ref = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const [entranceDone, setEntranceDone] = useState(false);
  const [uiVisible, setUiVisible] = useState(false);
  const featured = getFeaturedArticles().slice(0, 3);

  // Entrance sequence
  useEffect(() => {
    const t1 = setTimeout(() => {
      setUiVisible(true);
    }, 500);
    const t2 = setTimeout(() => {
      setEntranceDone(true);
    }, 2100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Starfield canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let stars: {
      x: number;
      y: number;
      z: number;
      r: number;
      tw: number;
      hue: number;
    }[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.floor((w * h) / 4500);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 0.8 + 0.2,
        r: Math.random() * 1.4 + 0.3,
        tw: Math.random() * Math.PI * 2,
        hue: Math.random() < 0.7 ? 0 : Math.random() < 0.5 ? 280 : 330,
      }));
    }
    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, w, h);
      t += 0.012;
      for (const s of stars) {
        const tw = 0.5 + 0.5 * Math.sin(t * 1.5 + s.tw);
        const alpha = (0.25 + 0.55 * tw) * s.z;
        if (s.hue === 0) {
          ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        } else {
          ctx.fillStyle = `hsla(${s.hue},80%,75%,${alpha})`;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * s.z, 0, Math.PI * 2);
        ctx.fill();
        // glow for bigger stars
        if (s.r > 1.2) {
          ctx.fillStyle =
            s.hue === 0
              ? `rgba(255,255,255,${alpha * 0.15})`
              : `hsla(${s.hue},80%,75%,${alpha * 0.15})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * s.z * 3, 0, Math.PI * 2);
          ctx.fill();
        }
        // slow drift
        s.y += 0.04 * s.z;
        if (s.y > h) {
          s.y = 0;
          s.x = Math.random() * w;
        }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Scroll + parallax render loop
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let mx = 0,
      my = 0,
      mxL = 0,
      myL = 0;
    const speed = 0.08;
    const isDesktop = () => window.matchMedia("(min-width: 1100px)").matches;

    function onMove(e: MouseEvent) {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    }
    document.addEventListener("mousemove", onMove);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const clamp = (v: number, mn: number, mx: number) =>
      Math.max(mn, Math.min(mx, v));
    const easeInOut = (t: number) =>
      t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const MAG = { nebula: 8, portal: 6, curtain: 14, cards: 5 };

    let rafActive = true;

    function render() {
      const rootEl = rootRef.current;
      if (!rootEl) return;
      const scrollY = window.scrollY || window.pageYOffset;
      const maxScroll = rootEl.scrollHeight - window.innerHeight;
      const sp = clamp(scrollY / maxScroll, 0, 1);
      const ep = easeInOut(sp);

      mxL = lerp(mxL, mx, speed);
      myL = lerp(myL, my, speed);
      const desktop = isDesktop();

      // Nebula (background clouds)
      if (nebulaRef.current) {
        const s = lerp(1, 1.35, ep);
        const tx = desktop ? -mxL * MAG.nebula : 0;
        const ty = desktop ? -myL * MAG.nebula : 0;
        nebulaRef.current.style.transform = `translate(${tx}px,${ty}px) scale(${s})`;
        nebulaRef.current.style.opacity = String(
          clamp(1 - sp / 0.7, 0.35, 1)
        );
      }

      // Portal ring (zoom-through)
      if (portalRef.current) {
        const s = lerp(1, 9, ep);
        const tx = desktop ? -mxL * MAG.portal : 0;
        const ty = desktop ? -myL * MAG.portal : 0;
        portalRef.current.style.transform = `translate(${tx}px,${ty}px) scale(${s})`;
        portalRef.current.style.opacity = sp <= 0.62 ? "1" : String(clamp(1 - (sp - 0.62) / 0.18, 0, 1));
      }

      // Curtains
      if (curtainLRef.current && curtainRRef.current && entranceDone) {
        const extra = lerp(0, 130, ep);
        const cs = lerp(1, 1.25, ep);
        const cLMx = desktop ? -mxL * MAG.curtain : 0;
        const cRMx = desktop ? -mxL * MAG.curtain : 0;
        curtainLRef.current.style.transform = `translate(${-62 - extra + cLMx}%,0) scale(${cs})`;
        curtainRRef.current.style.transform = `translate(${62 + extra + cRMx}%,0) scale(${cs})`;
      }

      // Scene 1 opacity
      if (scene1Ref.current && uiVisible) {
        const s1o = clamp(1 - sp / 0.22, 0, 1);
        scene1Ref.current.style.opacity = String(s1o);
      }

      // Cards parallax (within scene 1)
      if (cardsRef.current && uiVisible) {
        const tx = desktop ? -mxL * MAG.cards : 0;
        const ty = desktop ? -myL * MAG.cards : 0;
        cardsRef.current.style.transform = `translate(${tx}px,${ty}px)`;
      }

      // Scene 2 opacity (transition text)
      if (scene2Ref.current) {
        const s2o = clamp((sp - 0.7) / 0.18, 0, 1);
        scene2Ref.current.style.opacity = String(s2o);
        scene2Ref.current.style.pointerEvents = s2o > 0.5 ? "auto" : "none";
      }

      if (rafActive) raf = requestAnimationFrame(render);
    }

    let raf = requestAnimationFrame(render);

    function wake() {
      if (!rafActive) {
        rafActive = true;
        raf = requestAnimationFrame(render);
      }
    }
    document.addEventListener("mousemove", wake);
    window.addEventListener("scroll", wake, { passive: true });
    // stop continuous RAF after entrance to save CPU, re-wake on interaction
    setTimeout(() => {
      rafActive = false;
      cancelAnimationFrame(raf);
    }, 2400);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mousemove", wake);
      window.removeEventListener("scroll", wake);
    };
  }, [entranceDone, uiVisible]);

  const handleEnter = () => {
    // Smooth scroll to end of portal (start of blog)
    const root = rootRef.current;
    if (root) {
      const target = root.scrollHeight - window.innerHeight + 8;
      window.scrollTo({ top: target, behavior: "smooth" });
    }
  };

  return (
    <div
      ref={rootRef}
      className="portal-root"
      style={{ height: "380vh", position: "relative" }}
    >
      <div ref={viewportRef} className="portal-viewport">
        {/* Starfield canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ zIndex: 1 }}
        />

        {/* Nebula clouds (CSS radial gradients) */}
        <div
          ref={nebulaRef}
          className="absolute inset-0"
          style={{
            zIndex: 2,
            opacity: 0.6,
            background:
              "radial-gradient(ellipse 60% 40% at 30% 70%, rgba(139,92,246,0.45) 0%, transparent 60%), radial-gradient(ellipse 50% 35% at 75% 65%, rgba(236,72,153,0.35) 0%, transparent 60%), radial-gradient(ellipse 70% 30% at 50% 95%, rgba(20,184,166,0.25) 0%, transparent 60%)",
            filter: "blur(30px)",
            transformOrigin: "50% 70%",
          }}
        />

        {/* Bottom cloud band */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            zIndex: 8,
            height: "45%",
            background:
              "linear-gradient(to top, rgba(8,6,12,0.95) 0%, rgba(20,12,30,0.6) 40%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Portal ring (the gateway) */}
        <div
          ref={portalRef}
          className="absolute inset-0 grid place-items-center"
          style={{ zIndex: 6, transformOrigin: "50% 50%" }}
        >
          <div
            style={{
              width: "min(58vw, 620px)",
              height: "min(58vw, 620px)",
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 50% 50%, rgba(20,10,40,0) 0%, rgba(30,15,50,0.2) 35%, rgba(139,92,246,0.55) 48%, rgba(236,72,153,0.65) 50%, rgba(139,92,246,0.3) 53%, transparent 62%)",
              boxShadow:
                "0 0 80px rgba(139,92,246,0.5), 0 0 160px rgba(236,72,153,0.35), inset 0 0 80px rgba(20,10,40,0.6)",
              filter: "blur(0.5px)",
            }}
          />
          {/* inner swirl */}
          <div
            className="absolute"
            style={{
              width: "min(46vw, 480px)",
              height: "min(46vw, 480px)",
              borderRadius: "50%",
              background:
                "conic-gradient(from 0deg, rgba(139,92,246,0.4), rgba(236,72,153,0.5), rgba(20,184,166,0.35), rgba(139,92,246,0.4))",
              filter: "blur(28px)",
              opacity: 0.7,
              animation: "spin 24s linear infinite",
            }}
          />
        </div>

        {/* Top fade */}
        <div
          className="absolute top-0 left-0 right-0"
          style={{
            zIndex: 12,
            height: "40vh",
            background:
              "linear-gradient(to bottom, rgba(8,6,12,0.6) 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Curtains */}
        <div
          ref={curtainLRef}
          className="absolute inset-0"
          style={{
            zIndex: 14,
            transformOrigin: "left center",
            transform: "translateX(0)",
            transition: !entranceDone
              ? "transform 1.8s cubic-bezier(0.16,1,0.3,1)"
              : "none",
            background:
              "linear-gradient(to right, #08060c 0%, #120a18 55%, rgba(30,18,42,0.7) 85%, transparent 100%)",
          }}
        />
        <div
          ref={curtainRRef}
          className="absolute inset-0"
          style={{
            zIndex: 14,
            transformOrigin: "right center",
            transform: "translateX(0)",
            transition: !entranceDone
              ? "transform 1.8s cubic-bezier(0.16,1,0.3,1)"
              : "none",
            background:
              "linear-gradient(to left, #08060c 0%, #120a18 55%, rgba(30,18,42,0.7) 85%, transparent 100%)",
          }}
        />

        {/* Curtain gold trim (left/right edges) */}
        <div
          className="absolute top-0 bottom-0"
          style={{
            zIndex: 15,
            left: "38%",
            width: "2px",
            background:
              "linear-gradient(to bottom, transparent, rgba(245,200,140,0.6), transparent)",
            opacity: entranceDone ? 0 : 0.8,
            transition: "opacity 1.5s ease",
          }}
        />
        <div
          className="absolute top-0 bottom-0"
          style={{
            zIndex: 15,
            right: "38%",
            width: "2px",
            background:
              "linear-gradient(to bottom, transparent, rgba(245,200,140,0.6), transparent)",
            opacity: entranceDone ? 0 : 0.8,
            transition: "opacity 1.5s ease",
          }}
        />

        {/* Trigger curtain open on mount */}
        <CurtainTrigger
          curtainLRef={curtainLRef}
          curtainRRef={curtainRRef}
        />

        {/* Navigation overlay (portal-style) */}
        <PortalNav onEnter={handleEnter} />

        {/* Scene 1: Hero content */}
        <div
          ref={scene1Ref}
          className="absolute inset-0"
          style={{
            zIndex: 18,
            opacity: 0,
            transition: "opacity 0.8s ease",
            pointerEvents: uiVisible ? "auto" : "none",
          }}
        >
          <div
            className="w-full h-full flex flex-col items-center justify-center px-6 text-center"
            style={{
              opacity: uiVisible ? 1 : 0,
              transition: "opacity 1s ease 0.2s",
            }}
          >
            {/* Status pill */}
            <div
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-8"
              style={{
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.16)",
              }}
            >
              <span className="pulse-dot" />
              <span
                style={{
                  fontSize: "12px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                正在写作 · 2026
              </span>
            </div>

            {/* Hero title */}
            <h1
              className="font-black leading-[0.95] mb-6"
              style={{
                fontSize: "clamp(36px, 7vw, 84px)",
                letterSpacing: "-0.02em",
                color: "#fff",
                textShadow: "0 2px 30px rgba(0,0,0,0.6)",
                maxWidth: "900px",
              }}
            >
              AI <span style={{ color: "rgba(245,200,140,0.7)" }}>×</span> 建造
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #c4b5fd 0%, #f9a8d4 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                重新定义工程
              </span>
            </h1>

            <p
              className="mb-10"
              style={{
                fontSize: "clamp(15px, 1.6vw, 19px)",
                lineHeight: 1.7,
                color: "rgba(255,245,235,0.82)",
                maxWidth: "560px",
                textShadow: "0 1px 12px rgba(0,0,0,0.7)",
              }}
            >
              在代码、工程与智能之间，记录智能建造、能源工程与前沿技术的实践与思考。这里收藏关于计算机视觉、BIM、数字孪生与强化学习的工程随笔。
            </p>

            {/* Cards row: WeChat + article previews */}
            <div
              ref={cardsRef}
              className="flex flex-wrap items-stretch justify-center gap-4"
              style={{ maxWidth: "780px" }}
            >
              {/* WeChat card */}
              <div
                className="rounded-3xl p-5 flex flex-col justify-between text-left"
                style={{
                  width: "220px",
                  minHeight: "150px",
                  background:
                    "linear-gradient(135deg, rgba(16,185,129,0.25), rgba(20,184,166,0.15))",
                  border: "1px solid rgba(16,185,129,0.35)",
                  backdropFilter: "blur(14px)",
                  boxShadow: "0 12px 40px rgba(16,185,129,0.2)",
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: "#10b981",
                      display: "grid",
                      placeItems: "center",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: "16px",
                    }}
                  >
                    微
                  </span>
                  <div>
                    <div
                      style={{ color: "#fff", fontWeight: 700, fontSize: "14px" }}
                    >
                      AI4E建智工坊
                    </div>
                    <div
                      style={{
                        color: "rgba(255,255,255,0.6)",
                        fontSize: "11px",
                      }}
                    >
                      微信公众号
                    </div>
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.85)",
                      fontSize: "12px",
                      lineHeight: 1.5,
                      marginBottom: "8px",
                    }}
                  >
                    AI for Engineering — 工程智能化的实践笔记
                  </div>
                  <button
                    onClick={() =>
                      window.open("https://mp.weixin.qq.com/", "_blank")
                    }
                    className="btn-primary text-xs px-3 py-1.5 rounded-full"
                    style={{ fontWeight: 600 }}
                  >
                    关注 →
                  </button>
                </div>
              </div>

              {/* Article preview cards */}
              {featured.map((a, i) => (
                <button
                  key={a.id}
                  onClick={onEnterBlog}
                  className="rounded-3xl overflow-hidden text-left group"
                  style={{
                    width: "180px",
                    minHeight: "150px",
                    position: "relative",
                    background: `url(${a.img}) center/cover`,
                    border: "1px solid rgba(255,255,255,0.16)",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
                  }}
                  aria-label={`阅读：${a.title}`}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)",
                    }}
                  />
                  <div
                    className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{
                      background: a.color,
                      color: "#fff",
                    }}
                  >
                    {a.tagLabel}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div
                      style={{
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "13px",
                        lineHeight: 1.35,
                        marginBottom: "4px",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {a.title}
                    </div>
                    <div
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: "10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span>#{String(a.id).padStart(2, "0")}</span>
                      <span>·</span>
                      <span>{computeReadTime(a.body)} 分钟</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div
          className="absolute left-1/2 flex flex-col items-center gap-2.5"
          style={{
            zIndex: 20,
            bottom: "32px",
            transform: "translateX(-50%)",
            opacity: uiVisible && entranceDone ? 1 : 0,
            transition: "opacity 0.8s ease",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            穿越门户
          </span>
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              border: "1.5px solid rgba(255,255,255,0.5)",
              display: "grid",
              placeItems: "center",
              animation: "bobUp 1.8s ease-in-out infinite",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.8)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        {/* Scene 2: transition text */}
        <div
          ref={scene2Ref}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
          style={{ zIndex: 22, opacity: 0, pointerEvents: "none" }}
        >
          <div
            style={{
              fontSize: "clamp(28px, 5vw, 60px)",
              fontWeight: 800,
              letterSpacing: "0.02em",
              lineHeight: 1.1,
              color: "#fff",
              textShadow: "0 2px 24px rgba(0,0,0,0.5)",
              marginBottom: "16px",
            }}
          >
            进入知识世界
          </div>
          <p
            style={{
              fontSize: "clamp(14px, 1.5vw, 18px)",
              color: "rgba(255,255,255,0.7)",
              maxWidth: "420px",
            }}
          >
            12 篇关于 AI × 智能建造 × 能源工程的深度随笔，等你开启。
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
    </div>
  );
}

// Small helper component to trigger curtain open via inline style after mount
function CurtainTrigger({
  curtainLRef,
  curtainRRef,
}: {
  curtainLRef: React.RefObject<HTMLDivElement | null>;
  curtainRRef: React.RefObject<HTMLDivElement | null>;
}) {
  useEffect(() => {
    const t = setTimeout(() => {
      if (curtainLRef.current)
        curtainLRef.current.style.transform = "translateX(-62%)";
      if (curtainRRef.current)
        curtainRRef.current.style.transform = "translateX(62%)";
    }, 120);
    return () => clearTimeout(t);
  }, [curtainLRef, curtainRRef]);
  return null;
}

// Minimal portal nav (shown over the portal)
function PortalNav({ onEnter }: { onEnter: () => void }) {
  return (
    <nav
      className="absolute top-0 left-0 right-0 flex justify-between items-center px-6 md:px-12 py-5"
      style={{ zIndex: 30 }}
    >
      <div
        className="flex items-center gap-2.5 cursor-pointer"
        onClick={onEnter}
      >
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "9px",
            background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
            display: "grid",
            placeItems: "center",
            color: "#fff",
            fontWeight: 900,
            fontSize: "13px",
            boxShadow: "0 4px 16px rgba(139,92,246,0.5)",
          }}
        >
          lz
        </div>
        <span
          style={{
            color: "#fff",
            fontWeight: 800,
            fontSize: "17px",
            letterSpacing: "0.02em",
          }}
        >
          lzsobig
        </span>
      </div>
      <div className="hidden md:flex items-center gap-8">
        {["首页", "关于", "文章", "订阅"].map((t) => (
          <button
            key={t}
            onClick={onEnter}
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: "13px",
              letterSpacing: "0.06em",
              background: "none",
              border: "none",
              cursor: "pointer",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "#fff")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(255,255,255,0.8)")
            }
          >
            {t}
          </button>
        ))}
      </div>
      <button
        onClick={onEnter}
        className="btn-primary px-5 py-2 rounded-full text-xs font-semibold hidden sm:block"
      >
        进入博客 →
      </button>
    </nav>
  );
}
