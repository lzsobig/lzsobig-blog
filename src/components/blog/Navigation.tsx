"use client";

import { useEffect, useState } from "react";
import { useBlogStore } from "@/store/blog-store";

export default function Navigation() {
  const {
    theme,
    toggleTheme,
    bookmarks,
    setSearchOpen,
    setBookmarkPanelOpen,
    bookmarkPanelOpen,
    setHelpOpen,
    mobileMenuOpen,
    setMobileMenuOpen,
  } = useBlogStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "首页", href: "#hero" },
    { label: "关于", href: "#about" },
    { label: "文章", href: "#articles" },
    { label: "订阅", href: "#newsletter" },
  ];

  const handleNav = (href: string) => {
    setMobileMenuOpen(false);
    if (href === "#hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 nav-blur transition-all duration-300 ${
          scrolled ? "py-2" : "py-3"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleNav("#hero")}
            className="flex items-center gap-2.5 group"
            aria-label="lzsobig 首页"
          >
            <div
              className="grid place-items-center font-black text-white transition-transform group-hover:scale-110"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                fontSize: "14px",
                boxShadow: "0 4px 14px rgba(139,92,246,0.45)",
              }}
            >
              lz
            </div>
            <span
              className="font-extrabold text-lg tracking-tight"
              style={{ color: "var(--fg)" }}
            >
              lzsobig
            </span>
          </button>

          {/* Center links (desktop) */}
          <div className="hidden md:flex items-center gap-9">
            {navLinks.map((l) => (
              <button
                key={l.href}
                onClick={() => handleNav(l.href)}
                className="nav-link text-sm font-medium"
                style={{ color: "var(--fg-soft)" }}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg btn-ghost text-xs"
              aria-label="搜索文章"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <span style={{ color: "var(--fg-soft)" }}>搜索</span>
              <kbd>⌘K</kbd>
            </button>

            <button
              onClick={() => setBookmarkPanelOpen(!bookmarkPanelOpen)}
              className="relative p-2.5 rounded-lg btn-ghost"
              aria-label="我的收藏"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill={bookmarks.length > 0 ? "var(--accent2)" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
              </svg>
              {bookmarks.length > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-[10px] font-bold text-white grid place-items-center"
                  style={{
                    minWidth: "17px",
                    height: "17px",
                    padding: "0 4px",
                    borderRadius: "9px",
                    background: "linear-gradient(135deg, var(--accent), var(--accent2))",
                  }}
                >
                  {bookmarks.length}
                </span>
              )}
            </button>

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg btn-ghost"
              aria-label="切换主题"
            >
              {theme === "dark" ? (
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              ) : (
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              )}
            </button>

            <button
              onClick={() => setHelpOpen(true)}
              className="hidden sm:grid p-2.5 rounded-lg btn-ghost place-items-center"
              aria-label="键盘快捷键"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10" />
              </svg>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-lg btn-ghost"
              aria-label="菜单"
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
              >
                {mobileMenuOpen ? (
                  <>
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </>
                ) : (
                  <>
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu md:hidden">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-6 right-6 p-2"
            aria-label="关闭菜单"
          >
            <svg
              width="26"
              height="26"
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
          {navLinks.map((l) => (
            <button
              key={l.href}
              onClick={() => handleNav(l.href)}
              className="nav-link"
            >
              {l.label}
            </button>
          ))}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setSearchOpen(true);
            }}
            className="btn-primary px-6 py-3 rounded-full text-sm font-semibold"
          >
            搜索文章
          </button>
        </div>
      )}
    </>
  );
}
