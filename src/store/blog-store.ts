"use client";

import { create } from "zustand";

export type Theme = "dark" | "light";

interface BlogState {
  // Theme
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;

  // Bookmarks
  bookmarks: number[];
  toggleBookmark: (id: number) => void;
  isBookmarked: (id: number) => boolean;
  clearBookmarks: () => void;

  // Reader modal
  readerArticleId: number | null;
  openReader: (id: number) => void;
  closeReader: () => void;

  // Search modal
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;

  // Bookmark panel
  bookmarkPanelOpen: boolean;
  setBookmarkPanelOpen: (v: boolean) => void;

  // Help modal
  helpOpen: boolean;
  setHelpOpen: (v: boolean) => void;

  // Mobile menu
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;

  // Image zoom
  zoomImage: string | null;
  setZoomImage: (v: string | null) => void;

  // Toast
  toast: { msg: string; icon: string } | null;
  showToast: (msg: string, icon?: string) => void;
}

const THEME_KEY = "lzsobig-theme";
const BOOKMARK_KEY = "lzsobig-bookmarks";

function loadTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem(THEME_KEY) as Theme | null;
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function loadBookmarks(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

export const useBlogStore = create<BlogState>((set, get) => ({
  theme: "dark",
  setTheme: (t) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_KEY, t);
      document.documentElement.setAttribute("data-theme", t);
    }
    set({ theme: t });
  },
  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    get().setTheme(next);
  },

  bookmarks: [],
  toggleBookmark: (id) => {
    const cur = get().bookmarks;
    const exists = cur.includes(id);
    const next = exists ? cur.filter((b) => b !== id) : [...cur, id];
    if (typeof window !== "undefined") {
      localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next));
    }
    set({ bookmarks: next });
    get().showToast(
      exists ? "已取消收藏" : "已加入收藏",
      exists ? "bookmark-off" : "bookmark"
    );
  },
  isBookmarked: (id) => get().bookmarks.includes(id),
  clearBookmarks: () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(BOOKMARK_KEY, "[]");
    }
    set({ bookmarks: [] });
    get().showToast("已清空收藏", "bookmark-off");
  },

  readerArticleId: null,
  openReader: (id) => set({ readerArticleId: id }),
  closeReader: () => set({ readerArticleId: null }),

  searchOpen: false,
  setSearchOpen: (v) => set({ searchOpen: v }),

  bookmarkPanelOpen: false,
  setBookmarkPanelOpen: (v) => set({ bookmarkPanelOpen: v }),

  helpOpen: false,
  setHelpOpen: (v) => set({ helpOpen: v }),

  mobileMenuOpen: false,
  setMobileMenuOpen: (v) => set({ mobileMenuOpen: v }),

  zoomImage: null,
  setZoomImage: (v) => set({ zoomImage: v }),

  toast: null,
  showToast: (msg, icon = "check") => {
    set({ toast: { msg, icon } });
    setTimeout(() => set({ toast: null }), 2800);
  },
}));

// Initialize theme + bookmarks from localStorage on client
export function initBlogStore() {
  if (typeof window === "undefined") return;
  const theme = loadTheme();
  const bookmarks = loadBookmarks();
  document.documentElement.setAttribute("data-theme", theme);
  useBlogStore.setState({ theme, bookmarks });
}
