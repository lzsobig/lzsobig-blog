"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
  articles,
  getArticleById,
  getRelatedArticles,
  formatDate,
  computeReadTime,
  Article,
} from "@/data/articles";
import { useBlogStore } from "@/store/blog-store";

// Safe syntax highlighter (protects strings & comments)
const KEYWORDS =
  /\b(def|return|import|from|class|if|elif|else|for|while|in|not|and|or|is|None|True|False|try|except|finally|with|as|lambda|yield|async|await|pass|break|continue|global|nonlocal|raise|assert|del|function|let|const|var|type|extends|interface|new|this|typeof|instanceof|void|public|private|protected|static|readonly|infer|enum|export|default|struct|fn|impl|pub|use|match|mut|vec)\b/g;
const BUILTINS =
  /\b(gl_FragColor|gl_Position|gl_FragCoord|Math|console|document|window|self|print|len|range|enumerate|zip|map|filter|sorted|list|dict|set|tuple|int|float|str|bool|np|torch|self|texture2D|texture|normalize|dot|cross|mix|smoothstep|step|clamp|fract|floor|ceil|sin|cos|tan|pow|sqrt|abs|min|max|reflect|refract|length|distance|InfluxDB|Neo4j|Redis|PostgreSQL)\b/g;
const NUMBERS = /\b(\d+\.?\d*)\b/g;

function highlightCode(code: string): string {
  const slots: string[] = [];
  // protect comments
  code = code.replace(/(#[^\n]*|\/\/[^\n]*)/g, (m) => {
    slots.push(`<span class="tok-com">${escapeHtml(m)}</span>`);
    return `\u0000${slots.length - 1}\u0000`;
  });
  // protect strings
  code = code.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, (m) => {
    slots.push(`<span class="tok-str">${escapeHtml(m)}</span>`);
    return `\u0000${slots.length - 1}\u0000`;
  });
  // escape remaining
  code = escapeHtml(code);
  // keywords
  code = code.replace(KEYWORDS, '<span class="tok-key">$1</span>');
  // builtins
  code = code.replace(BUILTINS, '<span class="tok-fn">$1</span>');
  // numbers
  code = code.replace(NUMBERS, '<span class="tok-num">$1</span>');
  // restore slots
  code = code.replace(/\u0000(\d+)\u0000/g, (_, i) => slots[+i]);
  return code;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function processBody(body: string): { html: string; toc: TocItem[] } {
  // extract TOC from h2
  const toc: TocItem[] = [];
  let html = body;
  // process code blocks
  html = html.replace(
    /<pre><code>([\s\S]*?)<\/code><\/pre>/g,
    (_, code) => {
      const highlighted = highlightCode(code);
      return `<div class="code-block"><button class="copy-btn" data-code="${encodeURIComponent(
        code
      )}">复制</button><pre><code>${highlighted}</code></pre></div>`;
    }
  );
  // collect toc
  html = html.replace(/<h2 id="([^"]+)">([^<]+)<\/h2>/g, (_, id, text) => {
    toc.push({ id, text });
    return `<h2 id="${id}">${text}</h2>`;
  });
  return { html, toc };
}

interface TocItem {
  id: string;
  text: string;
}

export default function ReaderModal() {
  const {
    readerArticleId,
    closeReader,
    openReader,
    bookmarks,
    toggleBookmark,
    setZoomImage,
    showToast,
  } = useBlogStore();

  const panelRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [activeToc, setActiveToc] = useState<string>("");
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  const article = readerArticleId ? getArticleById(readerArticleId) : undefined;

  const { html, toc } = useMemo(() => {
    if (!article) return { html: "", toc: [] as TocItem[] };
    return processBody(article.body);
  }, [article]);

  // Scroll handling inside reader
  useEffect(() => {
    if (!article) return;
    const onScroll = () => {
      const panel = panelRef.current;
      if (!panel) return;
      const scrollTop = panel.scrollTop;
      const scrollHeight = panel.scrollHeight - panel.clientHeight;
      setProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);
      // active toc
      const headings = toc
        .map((t) => document.getElementById(t.id))
        .filter(Boolean) as HTMLElement[];
      let current = "";
      for (const h of headings) {
        if (h.getBoundingClientRect().top < 140) current = h.id;
      }
      setActiveToc(current);
    };
    const panel = panelRef.current;
    if (panel) panel.addEventListener("scroll", onScroll, { passive: true });
    // reset scroll to top on open
    if (panel) panel.scrollTop = 0;
    onScroll();
    return () => {
      if (panel)
        panel.removeEventListener("scroll", onScroll);
    };
  }, [article, toc]);

  // Lock body scroll + bind copy buttons + image zoom
  useEffect(() => {
    if (!article) return;
    document.body.style.overflow = "hidden";
    window.history.replaceState(null, "", `#article-${article.id}`);

    const panel = panelRef.current;
    if (!panel) return;

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // copy button
      const copyBtn = target.closest(".copy-btn") as HTMLElement | null;
      if (copyBtn) {
        const code = decodeURIComponent(copyBtn.dataset.code || "");
        navigator.clipboard?.writeText(code).then(() => {
          copyBtn.textContent = "已复制 ✓";
          setTimeout(() => (copyBtn.textContent = "复制"), 2000);
        });
        return;
      }
      // image zoom
      const img = target.closest(".zoomable") as HTMLImageElement | null;
      if (img) {
        setZoomImage(img.src);
      }
    };
    panel.addEventListener("click", onClick);

    return () => {
      document.body.style.overflow = "";
      panel.removeEventListener("click", onClick);
      window.history.replaceState(null, "", window.location.pathname);
    };
  }, [article, setZoomImage]);

  // Keyboard nav (Shift+arrows)
  useEffect(() => {
    if (!article) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "ArrowLeft") {
        e.preventDefault();
        const idx = articles.findIndex((a) => a.id === article.id);
        const prev = articles[(idx - 1 + articles.length) % articles.length];
        openReader(prev.id);
      } else if (e.shiftKey && e.key === "ArrowRight") {
        e.preventDefault();
        const idx = articles.findIndex((a) => a.id === article.id);
        const next = articles[(idx + 1) % articles.length];
        openReader(next.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [article, openReader]);

  if (!article) return null;

  const isMarked = bookmarks.includes(article.id);
  const related = getRelatedArticles(article, 3);
  const readTime = computeReadTime(article.body);
  const idx = articles.findIndex((a) => a.id === article.id);
  const prevArt = articles[(idx - 1 + articles.length) % articles.length];
  const nextArt = articles[(idx + 1) % articles.length];

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const text = article.title;
    if (platform === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
        "_blank"
      );
    } else if (platform === "weibo") {
      window.open(
        `https://service.weibo.com/share/share.php?title=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
        "_blank"
      );
    } else if (platform === "copy") {
      try {
        await navigator.clipboard.writeText(url);
        showToast("链接已复制", "share");
      } catch {
        showToast("复制失败", "share");
      }
    }
  };

  const scrollToToc = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setMobileTocOpen(false);
    }
  };

  return (
    <div className="reader-overlay">
      <div
        ref={panelRef}
        className="reader-panel"
        style={{ overflowY: "auto" }}
      >
        {/* Progress bar */}
        <div className="reader-progress">
          <div
            className="reader-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div
          className="sticky top-[3px] z-20 flex items-center justify-between px-4 md:px-8 py-3"
          style={{
            background: "var(--glass-strong)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <button
            onClick={closeReader}
            className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg btn-ghost"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 19-7-7 7-7M19 12H5" />
            </svg>
            <span className="hidden sm:inline">返回</span>
            <kbd>Esc</kbd>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleBookmark(article.id)}
              className="p-2.5 rounded-lg btn-ghost"
              aria-label="收藏"
              title="收藏 (B)"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={isMarked ? "var(--accent2)" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
              </svg>
            </button>
            <button
              onClick={() => openReader(prevArt.id)}
              className="p-2.5 rounded-lg btn-ghost hidden sm:grid place-items-center"
              aria-label="上一篇"
              title="上一篇 (Shift+←)"
            >
              <svg
                width="16"
                height="16"
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
              onClick={() => openReader(nextArt.id)}
              className="p-2.5 rounded-lg btn-ghost hidden sm:grid place-items-center"
              aria-label="下一篇"
              title="下一篇 (Shift+→)"
            >
              <svg
                width="16"
                height="16"
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
            <button
              onClick={() => handleShare("copy")}
              className="p-2.5 rounded-lg btn-ghost"
              aria-label="分享"
              title="复制链接"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
          </div>
        </div>

        {/* Article body */}
        <article className="max-w-3xl mx-auto px-5 md:px-8 py-10">
          {/* Meta */}
          <div className="flex items-center gap-3 mb-4">
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: article.color, color: "#fff" }}
            >
              {article.tagLabel}
            </span>
            <span className="text-xs" style={{ color: "var(--fg-muted)" }}>
              {formatDate(article.date)}
            </span>
            <span
              className="text-xs flex items-center gap-1"
              style={{ color: "var(--fg-muted)" }}
            >
              <svg
                width="12"
                height="12"
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
              {readTime} 分钟阅读
            </span>
          </div>

          <h1
            className="font-black mb-4 leading-tight"
            style={{ fontSize: "clamp(26px, 4vw, 40px)", color: "var(--fg)" }}
          >
            {article.title}
          </h1>
          <p
            className="mb-8"
            style={{
              fontSize: "18px",
              lineHeight: 1.6,
              color: "var(--fg-soft)",
            }}
          >
            {article.desc}
          </p>

          {/* Hero image */}
          <div
            className="rounded-2xl overflow-hidden mb-10 cursor-zoom-in"
            style={{ border: "1px solid var(--border-strong)" }}
          >
            <img
              src={article.img}
              alt={article.title}
              className="zoomable w-full aspect-video object-cover"
              loading="lazy"
            />
          </div>

          {/* Mobile TOC toggle */}
          {toc.length > 0 && (
            <div className="lg:hidden mb-6">
              <button
                onClick={() => setMobileTocOpen(!mobileTocOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl btn-ghost text-sm"
              >
                <span>📖 目录</span>
                <span>{mobileTocOpen ? "▲" : "▼"}</span>
              </button>
              {mobileTocOpen && (
                <div className="mt-2 p-4 rounded-xl glass">
                  {toc.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => scrollToToc(t.id)}
                      className="block w-full text-left py-1.5 text-sm"
                      style={{
                        color:
                          activeToc === t.id
                            ? "var(--accent)"
                            : "var(--fg-soft)",
                      }}
                    >
                      {t.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-8">
            {/* Content */}
            <div
              className="prose-blog flex-1 min-w-0"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            {/* Desktop TOC sidebar */}
            {toc.length > 0 && (
              <aside className="hidden lg:block w-52 flex-shrink-0">
                <div className="sticky top-24">
                  <div
                    className="text-xs font-semibold mb-3"
                    style={{ color: "var(--fg-muted)", letterSpacing: "0.1em" }}
                  >
                    目录
                  </div>
                  {toc.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => scrollToToc(t.id)}
                      className="block w-full text-left py-1.5 text-sm transition-colors"
                      style={{
                        color:
                          activeToc === t.id
                            ? "var(--accent)"
                            : "var(--fg-soft)",
                        borderLeft:
                          activeToc === t.id
                            ? "2px solid var(--accent)"
                            : "2px solid transparent",
                        paddingLeft: "12px",
                      }}
                    >
                      {t.text}
                    </button>
                  ))}
                  <div className="mt-6 pt-6 border-t" style={{ borderColor: "var(--border)" }}>
                    <div
                      className="text-xs font-semibold mb-3"
                      style={{ color: "var(--fg-muted)", letterSpacing: "0.1em" }}
                    >
                      分享
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleShare("twitter")}
                        className="w-9 h-9 rounded-lg btn-ghost grid place-items-center"
                        aria-label="分享到 Twitter"
                      >
                        𝕏
                      </button>
                      <button
                        onClick={() => handleShare("weibo")}
                        className="w-9 h-9 rounded-lg btn-ghost grid place-items-center text-xs"
                        aria-label="分享到微博"
                      >
                        微
                      </button>
                    </div>
                  </div>
                </div>
              </aside>
            )}
          </div>

          {/* Related */}
          <section className="mt-16 pt-10 border-t" style={{ borderColor: "var(--border)" }}>
            <h3
              className="font-bold mb-6"
              style={{ fontSize: "22px", color: "var(--fg)" }}
            >
              相关文章
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((r) => (
                <RelatedCard key={r.id} article={r} onOpen={openReader} />
              ))}
            </div>
          </section>

          {/* Prev/Next footer */}
          <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row gap-3" style={{ borderColor: "var(--border)" }}>
            <button
              onClick={() => openReader(prevArt.id)}
              className="flex-1 text-left p-4 rounded-xl btn-ghost"
            >
              <div className="text-xs mb-1" style={{ color: "var(--fg-muted)" }}>
                ← 上一篇
              </div>
              <div className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
                {prevArt.title}
              </div>
            </button>
            <button
              onClick={() => openReader(nextArt.id)}
              className="flex-1 text-right p-4 rounded-xl btn-ghost"
            >
              <div className="text-xs mb-1" style={{ color: "var(--fg-muted)" }}>
                下一篇 →
              </div>
              <div className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
                {nextArt.title}
              </div>
            </button>
          </div>

          <div
            className="text-center mt-8 text-xs"
            style={{ color: "var(--fg-muted)" }}
          >
            lzsobig · {formatDate(article.date)} · #{String(article.id).padStart(2, "0")}
          </div>
        </article>
      </div>
    </div>
  );
}

function RelatedCard({
  article,
  onOpen,
}: {
  article: Article;
  onOpen: (id: number) => void;
}) {
  return (
    <button
      onClick={() => onOpen(article.id)}
      className="text-left rounded-xl overflow-hidden group"
      style={{
        background: "var(--glass)",
        border: "1px solid var(--border-strong)",
      }}
    >
      <div className="aspect-video overflow-hidden">
        <img
          src={article.img}
          alt={article.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-3">
        <div
          className="text-xs mb-1"
          style={{ color: "var(--fg-muted)" }}
        >
          {article.tagLabel}
        </div>
        <div
          className="text-sm font-semibold leading-snug"
          style={{
            color: "var(--fg)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.title}
        </div>
      </div>
    </button>
  );
}
