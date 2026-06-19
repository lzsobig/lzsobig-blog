"use client";

import { useEffect, useRef } from "react";
import { useBlogStore, initBlogStore } from "@/store/blog-store";
import { articles } from "@/data/articles";
import PortalHero from "./PortalHero";
import Navigation from "./Navigation";
import FeaturedCarousel from "./FeaturedCarousel";
import {
  About,
  ArticlesGrid,
  Newsletter,
  Footer,
} from "./BlogSections";
import ReaderModal from "./ReaderModal";
import SearchModal from "./SearchModal";
import BookmarkPanel from "./BookmarkPanel";
import HelpModal from "./HelpModal";
import ImageZoom from "./ImageZoom";
import {
  CustomCursor,
  Particles,
  ProgressBar,
  BackToTop,
  ToastHost,
} from "./GlobalEffects";

export default function BlogOrchestrator() {
  const blogSectionRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);

  const {
    searchOpen,
    setSearchOpen,
    helpOpen,
    setHelpOpen,
    readerArticleId,
    closeReader,
    bookmarkPanelOpen,
    setBookmarkPanelOpen,
    mobileMenuOpen,
    setMobileMenuOpen,
    zoomImage,
    setZoomImage,
    toggleBookmark,
    openReader,
  } = useBlogStore();

  // Init theme + bookmarks from localStorage on mount
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    initBlogStore();
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const inInput = tag === "INPUT" || tag === "TEXTAREA";

      // Cmd/Ctrl + K → search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(!searchOpen);
        return;
      }

      // ? → help (not in input)
      if (e.key === "?" && !inInput) {
        e.preventDefault();
        setHelpOpen(!helpOpen);
        return;
      }

      // Esc → close (priority order)
      if (e.key === "Escape") {
        if (searchOpen) {
          setSearchOpen(false);
          return;
        }
        if (readerArticleId !== null) {
          closeReader();
          return;
        }
        if (helpOpen) {
          setHelpOpen(false);
          return;
        }
        if (zoomImage) {
          setZoomImage(null);
          return;
        }
        if (bookmarkPanelOpen) {
          setBookmarkPanelOpen(false);
          return;
        }
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
          return;
        }
        return;
      }

      // B → bookmark (reader only)
      if (
        (e.key === "b" || e.key === "B") &&
        !inInput &&
        readerArticleId !== null &&
        !searchOpen &&
        !helpOpen
      ) {
        e.preventDefault();
        toggleBookmark(readerArticleId);
        return;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    searchOpen,
    helpOpen,
    readerArticleId,
    bookmarkPanelOpen,
    mobileMenuOpen,
    zoomImage,
    setSearchOpen,
    setHelpOpen,
    closeReader,
    setBookmarkPanelOpen,
    setMobileMenuOpen,
    setZoomImage,
    toggleBookmark,
  ]);

  // Hash routing → open reader on load
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      const match = hash.match(/^#article-(\d+)$/);
      if (match) {
        const id = parseInt(match[1], 10);
        if (articles.some((a) => a.id === id)) {
          // wait for layout, then open
          setTimeout(() => openReader(id), 400);
        }
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  // Scroll reveal observer
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        }
      },
      { threshold: 0.12 }
    );
    const els = document.querySelectorAll(".reveal:not(.visible)");
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const handleEnterBlog = () => {
    if (blogSectionRef.current) {
      blogSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Global overlays */}
      <a href="#main-content" className="skip-link">
        跳到主要内容
      </a>
      <ProgressBar />
      <Particles />
      <CustomCursor />

      {/* Sticky nav */}
      <Navigation />

      {/* Portal hero (immersive opening) */}
      <PortalHero onEnterBlog={handleEnterBlog} />

      {/* Blog body */}
      <main
        id="main-content"
        ref={blogSectionRef}
        className="relative z-10 flex flex-col"
        style={{ minHeight: "auto" }}
      >
        <FeaturedCarousel />

        {/* Transition Zone — matching blog.html style */}
        <section
          className="py-16 md:py-20 px-6 md:px-12 relative z-10"
          style={{
            background:
              "linear-gradient(to bottom, rgba(6,8,15,0.95), var(--bg))",
          }}
        >
          <div className="max-w-4xl mx-auto text-center reveal">
            <div
              className="text-xs uppercase tracking-[0.3em] mb-4"
              style={{ color: "var(--accent)" }}
            >
              Welcome
            </div>
            <h2 className="text-2xl md:text-4xl font-black tracking-tight gradient-text">
              穿越门户，进入知识世界
            </h2>
            <p
              className="mt-4 text-base md:text-lg"
              style={{ color: "var(--fg-soft)" }}
            >
              这里有 AI 与工程交叉领域的技术拆解、行业观察和实用工具。
            </p>
          </div>
        </section>

        <About />
        <ArticlesGrid />
        <Newsletter />
        <Footer />
      </main>

      {/* Overlays */}
      {readerArticleId !== null && <ReaderModal />}
      <SearchModal />
      <BookmarkPanel />
      <HelpModal />
      <ImageZoom />

      {/* Floating UI */}
      <BackToTop />
      <ToastHost />
    </>
  );
}
