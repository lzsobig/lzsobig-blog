"use client";

import { useEffect, useRef, useState } from "react";
import { useTilt3D } from "@/hooks/useEffects";
import {
  articles,
  ArticleTag,
  formatDate,
  computeReadTime,
  getFeaturedArticles,
} from "@/data/articles";
import { useBlogStore } from "@/store/blog-store";

const TAG_FILTERS: { tag: ArticleTag | "all"; label: string }[] = [
  { tag: "all", label: "全部" },
  { tag: "smart-build", label: "智能建造" },
  { tag: "energy", label: "能源工程" },
  { tag: "ai-app", label: "AI 应用" },
  { tag: "frontier", label: "前沿技术" },
  { tag: "tools", label: "工具推荐" },
];

export function StatsBand() {
  const stats = [
    { value: 12, label: "已发布文章", suffix: "" },
    { value: 38, label: "千次阅读", suffix: "k" },
    { value: 2400, label: "订阅读者", suffix: "+" },
    { value: 4, label: "写作年数", suffix: "" },
  ];
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="py-16 md:py-20 relative" ref={ref}>
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-5">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="glass rounded-2xl p-6 md:p-8 text-center reveal"
            style={{
              transitionDelay: `${i * 80}ms`,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(30px)",
            }}
          >
            <Counter value={s.value} suffix={s.suffix} run={visible} />
            <div
              className="mt-2 text-sm"
              style={{ color: "var(--fg-muted)" }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Counter({
  value,
  suffix,
  run,
}: {
  value: number;
  suffix: string;
  run: boolean;
}) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1500;
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, value]);
  return (
    <div
      className="font-black text-4xl md:text-5xl gradient-text-accent"
      style={{ lineHeight: 1 }}
    >
      {n.toLocaleString()}
      {suffix}
    </div>
  );
}

export function About() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (e) => {
        if (e[0].isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="about" className="py-20 md:py-28 relative" ref={ref}>
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-5 gap-10 md:gap-12 items-center">
        {/* Avatar */}
        <div
          className={`md:col-span-2 reveal ${visible ? "visible" : ""}`}
          style={{ transitionDelay: "0ms" }}
        >
          <div className="relative mx-auto" style={{ maxWidth: "360px" }}>
            <div
              className="rounded-3xl overflow-hidden aspect-square"
              style={{
                background:
                  "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.3))",
                border: "1px solid var(--border-strong)",
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?q=80&w=800&auto=format&fit=crop"
                alt="lzsobig 头像"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            {/* Floating badge */}
            <div
              className="absolute -bottom-4 -right-4 glass-strong rounded-2xl px-4 py-3 flex items-center gap-2.5"
              style={{ boxShadow: "var(--shadow)" }}
            >
              <span className="pulse-dot" />
              <div>
                <div
                  className="text-xs font-semibold"
                  style={{ color: "var(--fg)" }}
                >
                  在线写作中
                </div>
                <div
                  className="text-[10px]"
                  style={{ color: "var(--fg-muted)" }}
                >
                  AI4E建智工坊
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div
          className={`md:col-span-3 reveal ${visible ? "visible" : ""}`}
          style={{ transitionDelay: "120ms" }}
        >
          <div
            className="text-sm font-semibold mb-3"
            style={{ color: "var(--accent)", letterSpacing: "0.1em" }}
          >
            关于作者
          </div>
          <h2
            className="font-black mb-6"
            style={{ fontSize: "clamp(28px, 4vw, 44px)", lineHeight: 1.15 }}
          >
            你好，我是{" "}
            <span className="gradient-text-accent">lzsobig</span>
          </h2>
          <div
            className="space-y-4 mb-7"
            style={{ color: "var(--fg-soft)", fontSize: "16px", lineHeight: 1.8 }}
          >
            <p>
              我是一名工程领域的从业者，致力于把 AI
              落地到真实的建造与能源场景。白天研究智能建造与结构健康监测，夜里写代码训练模型，周末在工地和实验室之间奔波。这个博客是我整理工程实践、记录技术实验、与同行对话的小空间。
            </p>
            <p>
              我相信工程不应只是经验的传承，它是可以被计算、被优化、被重新定义的系统。在这里你会读到关于
              BIM + AI 的智能审图、LSTM
              能耗预测、强化学习优化暖通、数字孪生技术栈的硬核拆解，也会读到关于工程现场落地痛点与反思的随笔。
            </p>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-2 gap-3 mb-7">
            <div className="glass rounded-xl p-4">
              <div
                className="text-xs font-semibold mb-1.5"
                style={{ color: "var(--accent)" }}
              >
                施工质量 · 结构监测
              </div>
              <div className="text-sm" style={{ color: "var(--fg-soft)" }}>
                CV 质量检测 · BIM 审图 · 无人机巡检
              </div>
            </div>
            <div className="glass rounded-xl p-4">
              <div
                className="text-xs font-semibold mb-1.5"
                style={{ color: "var(--accent2)" }}
              >
                能源优化 · 碳排核算
              </div>
              <div className="text-sm" style={{ color: "var(--fg-soft)" }}>
                能耗预测 · HVAC 优化 · 碳排核算
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="#articles"
              onClick={(e) => {
                e.preventDefault();
                document
                  .querySelector("#articles")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="btn-primary px-6 py-3 rounded-full text-sm font-semibold inline-flex items-center gap-2"
            >
              阅读文章
              <span>→</span>
            </a>
            <a
              href="https://mp.weixin.qq.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost px-6 py-3 rounded-full text-sm font-semibold inline-flex items-center gap-2"
            >
              <span>✉</span>
              关注公众号
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ArticlesGrid() {
  const [activeTag, setActiveTag] = useState<ArticleTag | "all">("all");
  const openReader = useBlogStore((s) => s.openReader);
  const bookmarks = useBlogStore((s) => s.bookmarks);
  const toggleBookmark = useBlogStore((s) => s.toggleBookmark);

  const filtered =
    activeTag === "all"
      ? articles
      : articles.filter((a) => a.tag === activeTag);

  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mo = new MutationObserver(() => {
      el.querySelectorAll(".reveal:not(.visible)").forEach((n) =>
        n.classList.add("visible")
      );
    });
    mo.observe(el, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, []);

  return (
    <section id="articles" className="py-20 md:py-28 relative" ref={ref}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10 md:mb-12">
          <div
            className="text-sm font-semibold mb-3"
            style={{ color: "var(--accent)", letterSpacing: "0.1em" }}
          >
            文章库
          </div>
          <h2
            className="font-black mb-4"
            style={{ fontSize: "clamp(30px, 4.5vw, 52px)" }}
          >
            最近的<span className="gradient-text-accent">书写</span>
          </h2>
          <p
            className="max-w-2xl mx-auto"
            style={{ color: "var(--fg-muted)", fontSize: "15px" }}
          >
            点击任意卡片进入阅读模式，支持键盘左右切换与 Esc 关闭。
          </p>
        </div>

        {/* Tag filters */}
        <div
          className="flex flex-wrap items-center justify-center gap-2.5 mb-10"
          role="tablist"
        >
          {TAG_FILTERS.map((f) => (
            <button
              key={f.tag}
              role="tab"
              aria-selected={activeTag === f.tag}
              onClick={() => setActiveTag(f.tag)}
              className={`tag-chip ${activeTag === f.tag ? "active" : ""}`}
            >
              <span>{f.label}</span>
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20" style={{ color: "var(--fg-muted)" }}>
            <div className="text-5xl mb-4">📂</div>
            <p>该分类下暂无文章</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((a, i) => {
              const isMarked = bookmarks.includes(a.id);
              return (
                <article
                  key={a.id}
                  className="article-card reveal"
                  style={{
                    transitionDelay: `${Math.min(i, 8) * 60}ms`,
                  }}
                  onMouseMove={(e) => {
                    const el = e.currentTarget;
                    const rect = el.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / rect.width;
                    const y = (e.clientY - rect.top) / rect.height;
                    el.style.setProperty("--tilt-x", `${(0.5 - y) * 10}deg`);
                    el.style.setProperty("--tilt-y", `${(x - 0.5) * 10}deg`);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.setProperty("--tilt-x", "0deg");
                    e.currentTarget.style.setProperty("--tilt-y", "0deg");
                  }}
                  onClick={() => openReader(a.id)}
                >
                  <div className="cover-wrap">
                    <img
                      src={a.img}
                      alt={a.title}
                      className="cover-img"
                      loading="lazy"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)",
                      }}
                    />
                    <div
                      className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                      style={{ background: a.color, color: "#fff" }}
                    >
                      {a.tagLabel}
                    </div>
                    {isMarked && (
                      <div
                        className="absolute top-3 right-3 w-7 h-7 rounded-full grid place-items-center"
                        style={{
                          background: "rgba(236,72,153,0.9)",
                          backdropFilter: "blur(8px)",
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="#fff"
                        >
                          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                        </svg>
                      </div>
                    )}
                    <div
                      className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-[11px]"
                      style={{
                        background: "rgba(0,0,0,0.55)",
                        backdropFilter: "blur(8px)",
                        color: "#fff",
                      }}
                    >
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {computeReadTime(a.body)} 分钟
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div
                      className="text-xs mb-2"
                      style={{ color: "var(--fg-muted)" }}
                    >
                      {formatDate(a.date)}
                    </div>
                    <h3
                      className="font-bold mb-2 leading-snug"
                      style={{ fontSize: "17px", color: "var(--fg)" }}
                    >
                      {a.title}
                    </h3>
                    <p
                      className="text-sm flex-1 mb-4"
                      style={{
                        color: "var(--fg-soft)",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {a.desc}
                    </p>
                    <div className="flex items-center justify-between">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: "var(--accent)" }}
                      >
                        阅读全文 →
                      </span>
                      <span
                        className="text-xs font-mono"
                        style={{ color: "var(--fg-muted)" }}
                      >
                        #{String(a.id).padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(a.id);
                    }}
                    className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="收藏"
                    style={{ display: "none" }}
                  />
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export function Newsletter() {
  const showToast = useBlogStore((s) => s.showToast);
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (e) => {
        if (e[0].isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    showToast(`已为你订阅 · ${email}`, "envelope");
    setEmail("");
  };

  return (
    <section
      id="newsletter"
      className="py-20 md:py-28 relative"
      ref={ref}
    >
      <div className="max-w-4xl mx-auto px-4">
        <div
          className={`newsletter-card relative rounded-3xl p-10 md:p-14 text-center overflow-hidden reveal ${
            visible ? "visible" : ""
          }`}
          style={{
            background: "var(--glass)",
            backdropFilter: "blur(16px)",
            border: "1px solid var(--border-strong)",
            transform: "perspective(800px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))",
            transition: "transform 0.5s cubic-bezier(0.03, 0.98, 0.52, 0.99), box-shadow 0.5s ease",
          }}
          onMouseMove={(e) => {
            const el = e.currentTarget;
            const rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            el.style.setProperty("--tilt-x", `${(0.5 - y) * 10}deg`);
            el.style.setProperty("--tilt-y", `${(x - 0.5) * 10}deg`);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.setProperty("--tilt-x", "0deg");
            e.currentTarget.style.setProperty("--tilt-y", "0deg");
          }}
        >
          {/* flowing glow accents */}
          <div
            className="absolute -top-20 -right-20 w-80 h-80 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)",
              filter: "blur(30px)",
              animation: "flowGlow1 8s ease-in-out infinite alternate",
            }}
          />
          <div
            className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(236,72,153,0.25) 0%, transparent 70%)",
              filter: "blur(30px)",
              animation: "flowGlow2 10s ease-in-out infinite alternate",
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full -translate-x-1/2 -translate-y-1/2"
            style={{
              background:
                "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
              filter: "blur(25px)",
              animation: "flowGlow3 12s ease-in-out infinite alternate",
            }}
          />
          <div className="relative">
            <div
              className="text-sm font-semibold mb-3"
              style={{ color: "var(--accent)", letterSpacing: "0.1em" }}
            >
              订阅信件
            </div>
            <h2
              className="font-black mb-4"
              style={{ fontSize: "clamp(26px, 3.5vw, 40px)" }}
            >
              每月一封，写给同样的你
            </h2>
            <p
              className="max-w-xl mx-auto mb-7"
              style={{ color: "var(--fg-soft)", fontSize: "15px", lineHeight: 1.7 }}
            >
              我会在每月的第一个周末寄出一封信，分享当月的工程实践笔记、读到的论文、用顺手的工具，以及一些只发给订阅者的实验性内容。无广告，可随时退订。
            </p>
            <form
              onSubmit={submit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="你的邮箱地址"
                required
                className="flex-1 px-5 py-3.5 rounded-full text-sm outline-none"
                style={{
                  background: "var(--bg-soft)",
                  border: "1px solid var(--border-strong)",
                  color: "var(--fg)",
                }}
              />
              <button
                type="submit"
                className="btn-primary magnetic-btn shimmer-btn px-6 py-3.5 rounded-full text-sm font-semibold whitespace-nowrap"
                onMouseMove={(e) => {
                  const el = e.currentTarget;
                  const rect = el.getBoundingClientRect();
                  const dx = e.clientX - (rect.left + rect.width / 2);
                  const dy = e.clientY - (rect.top + rect.height / 2);
                  el.style.transform = `translate(${dx * 0.25}px, ${dy * 0.25}px)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                }}
              >
                订阅 ✈
              </button>
            </form>
            <div
              className="mt-4 text-xs"
              style={{ color: "var(--fg-muted)" }}
            >
              🛡 你的邮箱不会被分享给任何第三方
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer
      className="mt-auto py-12 border-t"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div
            className="grid place-items-center font-black text-white"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "9px",
              background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
              fontSize: "12px",
            }}
          >
            lz
          </div>
          <div>
            <div
              className="font-extrabold"
              style={{ color: "var(--fg)", fontSize: "15px" }}
            >
              lzsobig
            </div>
            <div
              className="text-xs"
              style={{ color: "var(--fg-muted)" }}
            >
              © 2026 · AI × 建造 · 用心写作
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {[
            { label: "GitHub", icon: "github" },
            { label: "知乎", icon: "zhihu" },
            { label: "公众号", icon: "wechat" },
            { label: "RSS", icon: "rss" },
          ].map((s) => (
            <a
              key={s.label}
              href="#"
              aria-label={s.label}
              onClick={(e) => e.preventDefault()}
              className="w-10 h-10 rounded-full grid place-items-center transition-all hover:scale-110"
              style={{
                background: "var(--glass)",
                border: "1px solid var(--border-strong)",
                color: "var(--fg-soft)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "color-mix(in srgb, var(--accent) 25%, transparent)";
                e.currentTarget.style.color = "var(--fg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--glass)";
                e.currentTarget.style.color = "var(--fg-soft)";
              }}
            >
              <SocialIcon name={s.icon} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ name }: { name: string }) {
  const common = {
    width: 17,
    height: 17,
    viewBox: "0 0 24 24",
    fill: "currentColor",
  };
  switch (name) {
    case "github":
      return (
        <svg {...common}>
          <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.57.1.78-.25.78-.55v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.75.4-1.27.73-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.2-3.1-.12-.3-.52-1.46.1-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.5 3.17-1.18 3.17-1.18.63 1.6.23 2.76.11 3.05.75.81 1.2 1.84 1.2 3.1 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.66.79.55A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
        </svg>
      );
    case "zhihu":
      return (
        <svg {...common}>
          <path d="M5.721 0C2.251 0 0 2.25 0 5.719V18.28C0 21.751 2.252 24 5.721 24h12.56C21.751 24 24 21.75 24 18.281V5.72C24 2.249 21.75 0 18.281 0H5.72zm1.964 4.078c-.271.73-.5 1.434-.68 2.11h5.285v1.06H7.04v6.83h4.155c-.05.42-.117.812-.205 1.181-.32.96-1.04 2.06-2.16 3.3-1.12 1.24-2.36 2.32-3.72 3.24l-.66-.96c1.3-.84 2.46-1.84 3.48-3 1.02-1.16 1.66-2.18 1.92-3.06.13-.42.22-.85.27-1.3H7.16V7.32h5.285v-1.06H7.59c.18-.62.36-1.28.54-1.98l-1.4-.18zm7.561 1.18v14.5h1.4v-1.68h3.0v-12.82h-4.4zm1.4 1.06h2.16v10.7h-2.16V6.32z" />
        </svg>
      );
    case "wechat":
      return (
        <svg {...common}>
          <path d="M8.69 2C4.43 2 1 4.95 1 8.6c0 2.1 1.16 3.96 2.96 5.16-.14.5-.4 1.36-.46 1.56-.07.24.01.34.2.22.16-.1 1.06-.7 1.6-1.06.86.24 1.78.38 2.74.38h.48a5.4 5.4 0 0 1-.2-1.42c0-3.3 3.18-5.98 7.1-5.98h.5C15.5 4.13 12.4 2 8.69 2zm-2.3 3.2a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm4.6 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm5.4 3.8c-3.4 0-6.16 2.34-6.16 5.22 0 2.88 2.76 5.22 6.16 5.22.78 0 1.52-.12 2.2-.32.44.3 1.2.84 1.34.92.16.1.22.02.18-.18l-.36-1.32c1.5-1 2.46-2.54 2.46-4.3 0-2.88-2.76-5.22-6.16-5.22h.34zm-2.3 2.6a.85.85 0 1 1 0 1.7.85.85 0 0 1 0-1.7zm4.6 0a.85.85 0 1 1 0 1.7.85.85 0 0 1 0-1.7z" />
        </svg>
      );
    case "rss":
      return (
        <svg
          {...common}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 11a9 9 0 0 1 9 9" />
          <path d="M4 4a16 16 0 0 1 16 16" />
          <circle cx="5" cy="19" r="1" />
        </svg>
      );
    default:
      return null;
  }
}

// Featured carousel preview (optional, not used in main flow)
export function FeaturedPreview() {
  const featured = getFeaturedArticles();
  return (
    <div className="hidden">
      {featured.map((a) => (
        <span key={a.id}>{a.title}</span>
      ))}
    </div>
  );
}
