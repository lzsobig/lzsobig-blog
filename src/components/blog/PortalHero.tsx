"use client";

import { useEffect, useRef, useState } from "react";
import { getFeaturedArticles, formatDate, computeReadTime } from "@/data/articles";

interface PortalHeroProps {
  onEnterBlog: () => void;
}

/**
 * Faithful recreation of the original index.html "Step Into Wonder" portal.
 * Uses the original image assets (world / clouds / portal / curtains) and the
 * original layer + scroll-parallax logic. Only the scene-1 copy & cards are
 * swapped for the lzsobig blog (title, WeChat card, article previews).
 */
export default function PortalHero({ onEnterBlog }: PortalHeroProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLImageElement>(null);
  const cloudsRef = useRef<HTMLImageElement>(null);
  const portalRef = useRef<HTMLImageElement>(null);
  const curtainLRef = useRef<HTMLImageElement>(null);
  const curtainRRef = useRef<HTMLImageElement>(null);
  const scene1Ref = useRef<HTMLDivElement>(null);
  const scene2Ref = useRef<HTMLDivElement>(null);
  const scene1ChildrenRef = useRef<HTMLDivElement>(null);

  const [entranceDone, setEntranceDone] = useState(false);
  const [uiVisible, setUiVisible] = useState(false);

  const featured = getFeaturedArticles().slice(0, 3);

  // Entrance sequence: curtains open → UI fades in → entrance done
  useEffect(() => {
    const t1 = setTimeout(() => {
      if (curtainLRef.current)
        curtainLRef.current.style.transform = "translateX(-62%)";
      if (curtainRRef.current)
        curtainRRef.current.style.transform = "translateX(62%)";
    }, 120);

    const t2 = setTimeout(() => {
      setUiVisible(true);
      if (scene1ChildrenRef.current) {
        scene1ChildrenRef.current.style.transition = "opacity 0.9s ease";
        scene1ChildrenRef.current.style.opacity = "0.9";
      }
      if (scene1Ref.current) scene1Ref.current.style.pointerEvents = "auto";
    }, 620);

    const t3 = setTimeout(() => {
      setEntranceDone(true);
      if (curtainLRef.current) curtainLRef.current.style.transition = "none";
      if (curtainRRef.current) curtainRRef.current.style.transition = "none";
      if (scene1ChildrenRef.current)
        scene1ChildrenRef.current.style.transition = "none";
    }, 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Scroll + mouse-parallax render loop (mirrors original index.html logic)
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let mx = 0,
      my = 0,
      mxL = 0,
      myL = 0;
    const speed = 0.07;
    const MAG = { world: 6, clouds: 9, portal: 7, curtainL: 14, curtainR: 14 };
    const isDesktop = () => window.matchMedia("(min-width: 1100px)").matches;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const clamp = (v: number, mn: number, mx: number) =>
      Math.max(mn, Math.min(mx, v));
    const easeInOut = (t: number) =>
      t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    function onMove(e: MouseEvent) {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    }
    document.addEventListener("mousemove", onMove);

    let rafActive = true;
    let raf = 0;

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

      // World background
      if (worldRef.current) {
        const s = lerp(1, 1.18, ep);
        const tx = desktop ? -mxL * MAG.world : 0;
        const ty = desktop ? -myL * MAG.world : 0;
        worldRef.current.style.transform = `translate(${tx}px,${ty}px) scale(${s})`;
      }
      // Clouds
      if (cloudsRef.current) {
        const s = lerp(1, 1.4, ep);
        const tx = desktop ? -mxL * MAG.clouds : 0;
        const ty = desktop ? -myL * MAG.clouds * 0.4 : 0;
        cloudsRef.current.style.transform = `translate(${tx}px,${ty}px) scale(${s})`;
        cloudsRef.current.style.opacity = String(
          clamp(lerp(0.7, 1, sp / 0.05), 0.7, 1)
        );
      }
      // Portal frame (zoom-through)
      if (portalRef.current) {
        const s = lerp(1, 7.5, ep);
        const tx = desktop ? -mxL * MAG.portal : 0;
        const ty = desktop ? -myL * MAG.portal : 0;
        portalRef.current.style.transform = `translate(${tx}px,${ty}px) scale(${s})`;
        portalRef.current.style.opacity =
          sp <= 0.65 ? "1" : String(clamp(1 - (sp - 0.65) / 0.2, 0, 1));
      }
      // Curtains (after entrance)
      if (
        curtainLRef.current &&
        curtainRRef.current &&
        entranceDone
      ) {
        const extra = lerp(0, 150, ep);
        const cs = lerp(1, 1.3, ep);
        const cLx = desktop ? -mxL * MAG.curtainL : 0;
        const cLy = desktop ? -myL * MAG.curtainL * 0.3 : 0;
        const cRx = desktop ? -mxL * MAG.curtainR : 0;
        const cRy = desktop ? -myL * MAG.curtainR * 0.3 : 0;
        curtainLRef.current.style.transform = `translate(${-62 - extra + cLx}%,${cLy}px) scale(${cs})`;
        curtainRRef.current.style.transform = `translate(${62 + extra + cRx}%,${cRy}px) scale(${cs})`;
      }
      // Scene 1 opacity
      if (scene1Ref.current && uiVisible) {
        const s1o = clamp(1 - sp / 0.22, 0, 1);
        scene1Ref.current.style.opacity = String(s1o);
      }
      // Scene 2 opacity
      if (scene2Ref.current) {
        const s2o = clamp((sp - 0.68) / 0.16, 0, 1);
        scene2Ref.current.style.opacity = String(s2o);
        scene2Ref.current.style.paddingTop = "12vh";
      }

      if (rafActive) raf = requestAnimationFrame(render);
    }
    raf = requestAnimationFrame(render);

    function wake() {
      if (!rafActive) {
        rafActive = true;
        raf = requestAnimationFrame(render);
      }
    }
    document.addEventListener("mousemove", wake);
    window.addEventListener("scroll", wake, { passive: true });
    // stop continuous RAF after entrance to save CPU
    setTimeout(() => {
      rafActive = false;
      cancelAnimationFrame(raf);
    }, 2500);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mousemove", wake);
      window.removeEventListener("scroll", wake);
    };
  }, [entranceDone, uiVisible]);

  return (
    <div
      ref={rootRef}
      id="portal-root"
      style={{ height: "420vh", position: "relative" }}
    >
      <div
        id="viewport"
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          background: "#0a0608",
        }}
      >
        {/* Layer 1: World background */}
        <img
          ref={worldRef}
          src="/portal/world.webp"
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transformOrigin: "50% 50%",
            zIndex: 0,
          }}
        />
        {/* Layer 2: Bottom clouds */}
        <img
          ref={cloudsRef}
          src="/portal/clouds.webp"
          alt=""
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            width: "100%",
            height: "auto",
            transformOrigin: "50% 100%",
            zIndex: 10,
            opacity: 0.7,
          }}
        />
        {/* Layer 3: Portal frame */}
        <img
          ref={portalRef}
          src="/portal/portal.webp"
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transformOrigin: "52% 38%",
            zIndex: 15,
          }}
        />
        {/* Bottom fade */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "40%",
            background:
              "linear-gradient(to top,rgba(0,0,0,0.45) 0%,transparent 100%)",
            pointerEvents: "none",
            zIndex: 16,
          }}
        />
        {/* Layer 4L: Curtain left */}
        <img
          ref={curtainLRef}
          src="/portal/curtain-left.webp"
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "right center",
            transformOrigin: "left center",
            transform: "translateX(0)",
            transition: "transform 1.8s cubic-bezier(0.16,1,0.3,1)",
            zIndex: 16,
          }}
        />
        {/* Layer 4R: Curtain right */}
        <img
          ref={curtainRRef}
          src="/portal/curtain-right.webp"
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "left center",
            transformOrigin: "right center",
            transform: "translateX(0)",
            transition: "transform 1.8s cubic-bezier(0.16,1,0.3,1)",
            zIndex: 16,
          }}
        />
        {/* Top fade */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "42vh",
            background:
              "linear-gradient(to bottom,rgba(0,0,0,0.45) 0%,transparent 100%)",
            pointerEvents: "none",
            zIndex: 45,
          }}
        />

        {/* Navigation (portal style) */}
        <nav
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 50,
            padding: "22px 48px",
          }}
        >
          <div
            className="nav-group-desktop"
            style={{ display: "flex", gap: "36px" }}
          >
            {["首页", "关于", "文章"].map((t) => (
              <button
                key={t}
                onClick={onEnterBlog}
                style={{
                  fontFamily: "'Imprima',sans-serif",
                  fontSize: "12px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#fff",
                  opacity: 0.9,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {t}
              </button>
            ))}
          </div>
          {/* Star logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="lzsobig"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 2l2.09 6.42H23l-5.45 3.96 2.09 6.42L14 14.84l-5.64 4.06 2.09-6.42L4.96 8.42h6.95L14 2z"
                fill="white"
                opacity="0.9"
              />
              <circle cx="14" cy="24" r="1.5" fill="white" opacity="0.6" />
              <circle cx="6" cy="6" r="1" fill="white" opacity="0.4" />
              <circle cx="22" cy="6" r="1" fill="white" opacity="0.4" />
            </svg>
          </button>
          <div
            className="nav-group-desktop"
            style={{ display: "flex", gap: "36px" }}
          >
            {["订阅", "公众号", "联系"].map((t) => (
              <button
                key={t}
                onClick={onEnterBlog}
                style={{
                  fontFamily: "'Imprima',sans-serif",
                  fontSize: "12px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#fff",
                  opacity: 0.9,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </nav>

        {/* Scene 1: Hero content */}
        <div
          ref={scene1Ref}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            pointerEvents: "none",
            opacity: 0,
          }}
        >
          <div
            ref={scene1ChildrenRef}
            style={{ width: "100%", height: "100%", opacity: 0 }}
          >
            <div
              className="scene1-desktop"
              style={{ display: "block" }}
            >
              {/* Heading — centered in the portal opening (the arch ring) */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                  color: "#fff",
                  textShadow:
                    "0 2px 24px rgba(0,0,0,0.75),0 1px 4px rgba(0,0,0,0.95)",
                  width: "max-content",
                  maxWidth: "90vw",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Viaoda Libre',serif",
                    fontSize: "clamp(26px,3.4vw,44px)",
                    lineHeight: 1.05,
                    letterSpacing: "0.04em",
                  }}
                >
                  AI <span style={{ color: "rgba(255,220,180,0.75)" }}>×</span>{" "}
                  建造
                </div>
                <div
                  style={{
                    fontFamily: "'Viaoda Libre',serif",
                    fontSize: "clamp(40px,5.8vw,72px)",
                    lineHeight: 0.92,
                    letterSpacing: "-0.02em",
                    marginTop: "2px",
                  }}
                >
                  重新定义工程
                </div>
                <p
                  style={{
                    fontFamily: "'Imprima',sans-serif",
                    fontSize: "15px",
                    lineHeight: 1.6,
                    color: "rgba(255,245,235,0.92)",
                    maxWidth: "380px",
                    margin: "14px auto 0",
                    textShadow: "0 1px 12px rgba(0,0,0,0.9)",
                  }}
                >
                  在代码、工程与智能之间，记录智能建造与能源工程的实践与思考。
                </p>
              </div>

              {/* Cards (right) — original "View Reel" style play cards + number card */}
              <div
                style={{
                  position: "absolute",
                  right: "40px",
                  top: "62%",
                  transform: "translateY(-50%)",
                  display: "flex",
                  gap: "12px",
                }}
              >
                {/* Card 1: View Reel (featured article 1) */}
                {featured[0] && (
                  <button
                    onClick={onEnterBlog}
                    aria-label="View Reel"
                    style={{
                      width: "158px",
                      height: "158px",
                      borderRadius: "28px",
                      background: `url(${featured[0].img}) center/cover`,
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "60%",
                        background:
                          "linear-gradient(to top,rgba(0,0,0,0.55) 0%,transparent 100%)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "44%",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        maskImage:
                          "linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 100%)",
                        WebkitMaskImage:
                          "linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 100%)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: "12px",
                        left: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span
                        style={{
                          width: "30px",
                          height: "30px",
                          background: "#fff",
                          borderRadius: "50%",
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        <svg
                          width="11"
                          height="13"
                          viewBox="0 0 10 12"
                          fill="none"
                        >
                          <path d="M0 0L10 6L0 12V0Z" fill="#1a1a1a" />
                        </svg>
                      </span>
                      <span
                        style={{
                          fontFamily: "'Imprima',sans-serif",
                          fontSize: "18px",
                          color: "#fff",
                        }}
                      >
                        View Reel
                      </span>
                    </div>
                  </button>
                )}

                {/* Card 2: Number stat (like original "32 World Patrons") */}
                <button
                  onClick={onEnterBlog}
                  style={{
                    width: "158px",
                    height: "158px",
                    borderRadius: "28px",
                    background: `url(${featured[1]?.img || ""}) center/cover`,
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "60%",
                      background:
                        "linear-gradient(to top,rgba(0,0,0,0.55) 0%,transparent 100%)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "12px",
                      left: "12px",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Viaoda Libre',serif",
                        fontSize: "36px",
                        color: "#fff",
                        lineHeight: 1,
                      }}
                    >
                      12
                    </div>
                    <div
                      style={{
                        fontFamily: "'Imprima',sans-serif",
                        fontSize: "14px",
                        color: "rgba(255,255,255,0.85)",
                      }}
                    >
                      深度随笔
                    </div>
                  </div>
                </button>

                {/* Card 3: View Reel (featured article 2) */}
                {featured[2] && (
                  <button
                    onClick={onEnterBlog}
                    aria-label="View Reel"
                    style={{
                      width: "158px",
                      height: "158px",
                      borderRadius: "28px",
                      background: `url(${featured[2].img}) center/cover`,
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "60%",
                        background:
                          "linear-gradient(to top,rgba(0,0,0,0.55) 0%,transparent 100%)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "44%",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        maskImage:
                          "linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 100%)",
                        WebkitMaskImage:
                          "linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 100%)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: "12px",
                        left: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span
                        style={{
                          width: "30px",
                          height: "30px",
                          background: "#fff",
                          borderRadius: "50%",
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        <svg
                          width="11"
                          height="13"
                          viewBox="0 0 10 12"
                          fill="none"
                        >
                          <path d="M0 0L10 6L0 12V0Z" fill="#1a1a1a" />
                        </svg>
                      </span>
                      <span
                        style={{
                          fontFamily: "'Imprima',sans-serif",
                          fontSize: "18px",
                          color: "#fff",
                        }}
                      >
                        View Reel
                      </span>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Slider dots (bottom-left, like original) */}
            <div
              style={{
                position: "absolute",
                bottom: "40px",
                left: "60px",
                display: "flex",
                gap: "6px",
                alignItems: "center",
                zIndex: 20,
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "4px",
                  borderRadius: "2px",
                  background: "rgba(255,255,255,0.9)",
                }}
              />
              {[14, 14, 14].map((w, i) => (
                <div
                  key={i}
                  style={{
                    width: `${w}px`,
                    height: "4px",
                    borderRadius: "2px",
                    background: "rgba(255,255,255,0.35)",
                  }}
                />
              ))}
            </div>

            {/* DESCEND scroll cue (bottom-center, like original) */}
            <div
              style={{
                position: "absolute",
                bottom: "36px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
                zIndex: 20,
              }}
            >
              <span
                style={{
                  fontFamily: "'Imprima',sans-serif",
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
                  stroke="rgba(255,255,255,0.7)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            {/* Mobile / tablet centered layout */}
            <div
              className="scene1-mobile"
              style={{
                display: "none",
                flexDirection: "column",
                alignItems: "center",
                padding: "80px 24px 100px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "'Viaoda Libre',serif",
                  color: "#fff",
                  textShadow: "0 2px 16px rgba(0,0,0,0.8)",
                }}
              >
                <div
                  style={{ fontSize: "clamp(26px,7vw,42px)", letterSpacing: "0.08em" }}
                >
                  AI <span style={{ color: "rgba(255,220,180,0.7)" }}>×</span>{" "}
                  建造
                </div>
                <div
                  style={{
                    fontSize: "clamp(48px,15vw,76px)",
                    letterSpacing: "-0.02em",
                    lineHeight: 0.9,
                  }}
                >
                  重新定义工程
                </div>
              </div>
              <p
                style={{
                  fontFamily: "'Imprima',sans-serif",
                  fontSize: "14px",
                  lineHeight: 1.7,
                  color: "rgba(255,245,235,0.9)",
                  maxWidth: "300px",
                  marginTop: "18px",
                  textShadow: "0 1px 10px rgba(0,0,0,0.8)",
                }}
              >
                在代码、工程与智能之间，记录智能建造与能源工程的实践与思考。
              </p>
              <button
                onClick={onEnterBlog}
                style={{
                  marginTop: "22px",
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#fff",
                  padding: "10px 24px",
                  borderRadius: "999px",
                  fontFamily: "'Imprima',sans-serif",
                  fontSize: "12px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                进入博客 →
              </button>
            </div>
          </div>
        </div>

        {/* Scene 2: gateway into the knowledge world (minimal) */}
        <div
          ref={scene2Ref}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 46,
            opacity: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 24px",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              maxWidth: "560px",
            }}
          >
            {/* Title */}
            <div
              style={{
                fontFamily: "'Viaoda Libre',serif",
                fontSize: "clamp(36px,6vw,72px)",
                letterSpacing: "0.03em",
                lineHeight: 1.05,
                color: "#fff",
                textShadow: "0 2px 24px rgba(0,0,0,0.5)",
                marginBottom: "18px",
              }}
            >
              进入知识世界
            </div>

            {/* Subtitle */}
            <p
              style={{
                fontFamily: "'Imprima',sans-serif",
                fontSize: "clamp(15px,1.5vw,18px)",
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.8)",
                maxWidth: "420px",
                margin: "0 0 28px",
                textShadow: "0 1px 12px rgba(0,0,0,0.6)",
              }}
            >
              12 篇关于 AI × 智能建造 × 能源工程的深度随笔，等你开启。
            </p>

            {/* CTA button (simple outline) */}
            <button
              onClick={onEnterBlog}
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.35)",
                color: "#fff",
                padding: "13px 34px",
                borderRadius: "999px",
                fontFamily: "'Imprima',sans-serif",
                fontSize: "13px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
                pointerEvents: "auto",
              }}
            >
              开始阅读 →
            </button>
          </div>
        </div>

        {/* Responsive layout switch (CSS) */}
        <style>{`
          @media (max-width: 1099px) {
            #portal-root .scene1-desktop { display: none !important; }
            #portal-root .scene1-mobile { display: flex !important; }
            #portal-root .nav-group-desktop { display: none !important; }
          }
        `}</style>
      </div>
    </div>
  );
}
