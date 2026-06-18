# Worklog — lzsobig Personal Blog (Portal + LUMINA merge)

Project: Merge `index.html` (immersive Portal hero) + `LUMINA.html` (blog) into a Next.js personal blog for "lzsobig" focused on AI × 建造/能源 (AI × Construction/Energy).

---
Task ID: 1
Agent: main
Task: Foundation — article data, global CSS theme system, Zustand store, layout fonts/metadata

Work Log:
- Created article data file with 12 AI+construction/energy articles (full body HTML content, code samples, blockquotes)
- Built global CSS theme system (dark/light variables, portal colors, animations, prose styles, code highlighting)
- Created Zustand store for blog UI state (theme, bookmarks, reader, search, bookmark panel, help, mobile menu)
- Updated layout.tsx with Outfit + Noto Serif SC + JetBrains Mono fonts + blog metadata

---
Task ID: 2-8
Agent: main
Task: Build all components (Portal Hero, Nav, 3D Carousel, Stats, About, Articles grid, Newsletter, Footer, Reader modal, Search, Bookmark panel, Help, Image zoom, Global effects) + assemble page + lint + Agent Browser verification

Work Log:
- Built PortalHero: starfield canvas, nebula gradients, portal ring (conic-gradient swirl), curtains open animation, scroll-driven parallax/zoom, scene transitions, WeChat + article preview cards
- Built Navigation: lzsobig logo, nav links, search (Cmd+K), bookmark (with count badge), theme toggle, help, mobile hamburger menu
- Built FeaturedCarousel: 3D rotating ring of 7 featured articles (preserve-3d + rotateY), drag/swipe, autoplay toggle, indicators, prev/next, keyboard arrows
- Built BlogSections: StatsBand (animated counters), About (avatar + bio + WeChat "AI4E建智工坊" + info cards), ArticlesGrid (6 tag filters + 12 cards w/ cover/tag/date/readtime/bookmark badge), Newsletter (email form + toast), Footer (logo + social icons)
- Built ReaderModal: full-screen overlay, sticky progress bar, TOC sidebar (desktop) + collapsible (mobile), code syntax highlighting + copy buttons, image zoom, prev/next (Shift+arrows), share (Twitter/Weibo/copy), related articles, bookmark (B)
- Built SearchModal: Cmd+K, scored search (title/desc/tag/body), keyboard nav (↑↓ Enter), highlight matches, quick chips, mounts on open (state resets naturally)
- Built BookmarkPanel: slide-down panel, localStorage persistence, clear/remove, click to open
- Built HelpModal + ImageZoom overlays
- Built GlobalEffects: custom cursor (dot + lerped ring, hover scale), particles (28 floating dots), reading progress bar, back-to-top, toast host
- Built BlogOrchestrator: wires keyboard shortcuts (Cmd+K, ?, Esc, B, Shift+arrows, arrows), theme init from localStorage, hash routing (#article-N), scroll reveal observer
- Created Zustand store (theme, bookmarks, reader, search, bookmark panel, help, mobile menu, image zoom, toast) with localStorage persistence
- Created 12 AI+建造/能源 articles with full body content (code samples, blockquotes, 5 sections each)
- Global CSS theme system (dark/light variables, portal styles, prose, code highlighting tokens, glass, animations)
- layout.tsx: Outfit + Noto Serif SC + JetBrains Mono fonts, blog metadata, SVG favicon
- Fixed hydration mismatch (particles generated client-side after mount)
- Fixed lint errors (set-state-in-effect rule via deferred setTimeout + mount-on-open pattern)
- Agent Browser verification: portal renders, 3D carousel rotates, article reader opens w/ TOC+code blocks, search (Cmd+K) returns highlighted results, theme toggle works, bookmark (B) persists to localStorage + toast, bookmark panel shows items, tag filters work (工具推荐 → 1 card), help (?), mobile menu, responsive mobile (390x844), footer at bottom, no console errors / hydration warnings

Stage Summary:
- Single-page personal blog "lzsobig · AI × 建造" merging Portal immersive opening (index.html) + LUMINA blog features
- All elements from both source files preserved: Portal (curtains, starfield, portal ring zoom, parallax, scene transitions) + LUMINA (3D carousel, custom cursor, particles, reader modal w/ TOC+code highlight+share, Cmd+K search, localStorage bookmarks, help, image zoom, toast, back-to-top, theme toggle, animated stat counters, scroll reveal)
- 12 original AI+建造/能源 articles with full HTML body content
- Lint clean, dev server running, all core interactions browser-verified

---
Task ID: 9-12
Agent: main
Task: Simplify homepage per user feedback — keep Portal Hero 100% intact (crystal), remove redundant 3D carousel, smooth transition

Work Log:
- User feedback: 首页太杂 + Portal 水晶很好看要全保留
- Removed FeaturedCarousel (3D rotating ring) from BlogOrchestrator — it duplicated the Portal preview cards AND the articles grid (featured articles shown 3 times = clutter)
- Kept PortalHero 100% unchanged (crystal ring, curtains, starfield, nebula, WeChat card, 3 article preview cards, scene transitions, scroll-zoom)
- Added smooth Portal → blog transition: gradient fade from portal darkness + "欢迎进入 知识世界" welcome heading above Stats band
- New section order: Portal → 知识世界(Stats) → 关于 → 文章 → 订阅 → Footer
- Lint clean, no console errors, Agent Browser verified: carousel gone, portal intact, reader/search/theme all work

Stage Summary:
- Homepage decluttered: removed redundant 3D carousel section
- Portal crystal effect fully preserved (user-requested "全保留")
- Clean transition from immersive portal into blog content
