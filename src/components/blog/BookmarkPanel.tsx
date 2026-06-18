"use client";

import { useEffect, useRef } from "react";
import { articles, getArticleById } from "@/data/articles";
import { useBlogStore } from "@/store/blog-store";

export default function BookmarkPanel() {
  const {
    bookmarkPanelOpen,
    setBookmarkPanelOpen,
    bookmarks,
    openReader,
    toggleBookmark,
    clearBookmarks,
  } = useBlogStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bookmarkPanelOpen) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setBookmarkPanelOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBookmarkPanelOpen(false);
    };
    setTimeout(() => {
      document.addEventListener("click", onClick);
      document.addEventListener("keydown", onKey);
    }, 0);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [bookmarkPanelOpen, setBookmarkPanelOpen]);

  if (!bookmarkPanelOpen) return null;

  const items = bookmarks
    .map((id) => getArticleById(id))
    .filter(Boolean) as ReturnType<typeof getArticleById> extends infer T
    ? NonNullable<T>[]
    : never;

  return (
    <div ref={ref} className="bookmark-panel">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div
          className="font-bold text-sm flex items-center gap-2"
          style={{ color: "var(--fg)" }}
        >
          <span>🔖</span> 我的收藏
        </div>
        {items.length > 0 && (
          <button
            onClick={clearBookmarks}
            className="text-xs"
            style={{ color: "var(--fg-muted)" }}
          >
            清空
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2">
        {items.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-3xl mb-2 opacity-40">📭</div>
            <p
              className="text-xs"
              style={{ color: "var(--fg-muted)", lineHeight: 1.6 }}
            >
              还没有收藏的文章
              <br />
              阅读时按 <kbd>B</kbd> 或点击书签图标收藏
            </p>
          </div>
        ) : (
          items.map((a) => (
            <div
              key={a!.id}
              className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] cursor-pointer group"
              onClick={() => {
                setBookmarkPanelOpen(false);
                openReader(a!.id);
              }}
            >
              <img
                src={a!.img}
                alt=""
                className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <div
                  className="text-xs font-semibold truncate"
                  style={{ color: "var(--fg)" }}
                >
                  {a!.title}
                </div>
                <div
                  className="text-[11px] truncate"
                  style={{ color: "var(--fg-muted)" }}
                >
                  {a!.tagLabel}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBookmark(a!.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                aria-label="移除"
                style={{ color: "var(--fg-muted)" }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div
          className="px-4 py-2.5 border-t text-xs text-center"
          style={{
            borderColor: "var(--border)",
            color: "var(--fg-muted)",
          }}
        >
          共 {items.length} 篇收藏
        </div>
      )}
    </div>
  );
}

// suppress unused warning for articles import (kept for potential future use)
void articles;
