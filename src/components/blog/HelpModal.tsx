"use client";

import { useBlogStore } from "@/store/blog-store";

export default function HelpModal() {
  const { helpOpen, setHelpOpen } = useBlogStore();
  if (!helpOpen) return null;

  const shortcuts = [
    { keys: "⌘ K", desc: "搜索文章" },
    { keys: "← →", desc: "切换卡片（首页）" },
    { keys: "Shift + ←/→", desc: "上/下一篇（阅读时）" },
    { keys: "B", desc: "收藏当前文章" },
    { keys: "?", desc: "打开快捷键帮助" },
    { keys: "Esc", desc: "关闭弹窗" },
  ];

  return (
    <div
      className="help-overlay grid place-items-center p-4"
      onClick={(e) => e.target === e.currentTarget && setHelpOpen(false)}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden glass-strong p-6"
        style={{ boxShadow: "var(--shadow)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3
            className="font-bold text-lg"
            style={{ color: "var(--fg)" }}
          >
            ⌨ 键盘快捷键
          </h3>
          <button
            onClick={() => setHelpOpen(false)}
            className="p-1.5 rounded-lg btn-ghost"
            aria-label="关闭"
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
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-3">
          {shortcuts.map((s) => (
            <div
              key={s.desc}
              className="flex items-center justify-between py-2 border-b last:border-0"
              style={{ borderColor: "var(--border)" }}
            >
              <span
                className="text-sm"
                style={{ color: "var(--fg-soft)" }}
              >
                {s.desc}
              </span>
              <kbd
                style={{ fontSize: "12px", padding: "3px 8px" }}
              >
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
