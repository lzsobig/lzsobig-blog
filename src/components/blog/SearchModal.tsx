"use client";

import { useEffect, useRef, useState } from "react";
import { articles, formatDate, computeReadTime } from "@/data/articles";
import { useBlogStore } from "@/store/blog-store";

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightMatch(text: string, query: string): string {
  if (!query) return text;
  const re = new RegExp(`(${escapeRegExp(query)})`, "gi");
  return text.replace(re, "<mark>$1</mark>");
}

export default function SearchModal() {
  const searchOpen = useBlogStore((s) => s.searchOpen);
  // Only mount the inner panel when open → state resets naturally on each open
  if (!searchOpen) return null;
  return <SearchPanel />;
}

function SearchPanel() {
  const { setSearchOpen, openReader } = useBlogStore();
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(id);
  }, []);

  const results = query
    ? articles
        .map((a) => {
          const body = a.body.replace(/<[^>]+>/g, "");
          let score = 0;
          if (a.title.toLowerCase().includes(query.toLowerCase())) score += 10;
          if (a.desc.toLowerCase().includes(query.toLowerCase())) score += 5;
          if (a.tagLabel.includes(query)) score += 4;
          if (body.toLowerCase().includes(query.toLowerCase())) score += 1;
          return { article: a, score };
        })
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((r) => r.article)
    : [];

  const quickChips = ["智能建造", "能源", "BIM", "AI", "数字孪生"];

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIdx]) {
      e.preventDefault();
      openArticle(results[activeIdx].id);
    }
  };

  const openArticle = (id: number) => {
    setSearchOpen(false);
    openReader(id);
  };

  return (
    <div
      className="search-overlay"
      onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}
    >
      <div
        className="w-full max-w-2xl mx-4 mt-[12vh] rounded-2xl overflow-hidden glass-strong"
        style={{ boxShadow: "var(--shadow)" }}
      >
        {/* Input */}
        <div
          className="flex items-center gap-3 px-5 py-4 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--fg-muted)" }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIdx(0);
            }}
            onKeyDown={onKey}
            placeholder="搜索文章、标签、关键词..."
            className="flex-1 bg-transparent outline-none text-base"
            style={{ color: "var(--fg)" }}
          />
          <kbd>Esc</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[55vh] overflow-y-auto">
          {!query ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-3 opacity-50">⌨</div>
              <p
                className="text-sm mb-5"
                style={{ color: "var(--fg-muted)" }}
              >
                输入关键词搜索全部 {articles.length} 篇文章
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {quickChips.map((c) => (
                  <button
                    key={c}
                    onClick={() => setQuery(c)}
                    className="tag-chip"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-4xl mb-3 opacity-40">🔍</div>
              <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
                没有找到与「{query}」相关的文章
              </p>
            </div>
          ) : (
            <div className="py-2">
              {results.map((a, i) => (
                <button
                  key={a.id}
                  onClick={() => openArticle(a.id)}
                  onMouseEnter={() => setActiveIdx(i)}
                  className="w-full flex items-center gap-4 px-5 py-3 text-left transition-colors"
                  style={{
                    background:
                      i === activeIdx
                        ? "color-mix(in srgb, var(--accent) 12%, transparent)"
                        : "transparent",
                  }}
                >
                  <img
                    src={a.img}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                        style={{ background: a.color, color: "#fff" }}
                      >
                        {a.tagLabel}
                      </span>
                      <span
                        className="text-[11px]"
                        style={{ color: "var(--fg-muted)" }}
                      >
                        {computeReadTime(a.body)} 分钟
                      </span>
                    </div>
                    <div
                      className="text-sm font-semibold truncate"
                      style={{ color: "var(--fg)" }}
                      dangerouslySetInnerHTML={{
                        __html: highlightMatch(a.title, query),
                      }}
                    />
                    <div
                      className="text-xs truncate"
                      style={{ color: "var(--fg-muted)" }}
                      dangerouslySetInnerHTML={{
                        __html: highlightMatch(a.desc, query),
                      }}
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-2.5 border-t text-xs"
          style={{
            borderColor: "var(--border)",
            color: "var(--fg-muted)",
          }}
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd>↑</kbd>
              <kbd>↓</kbd> 导航
            </span>
            <span className="flex items-center gap-1">
              <kbd>↵</kbd> 打开
            </span>
          </div>
          <span>共 {results.length} 条结果</span>
        </div>
      </div>
    </div>
  );
}

// silence unused import warning (formatDate kept for potential future use)
void formatDate;
