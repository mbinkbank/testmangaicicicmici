import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase, type MangaRow } from "./lib/supabase";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Flame,
  List,
  Lock,
  LogOut,
  Menu,
  Moon,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Sun,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useDarkMode } from "./useDarkMode";

/* ────────── Types ────────── */

type Manga = {
  id: string;
  title: string;
  author: string;
  genre: string;
  season?: string;
  cover: string;
  chapter: number;
  rating: string;
  description: string;
  isUserUpload?: boolean;
};

/* ────────── Data ────────── */

const manga: Manga[] = [
  {
    id: "astral-garden",
    title: "Astral Garden",
    author: "Nami Ishida",
    genre: "Sci-fi",
    cover: "/covers/astral-garden.jpg",
    chapter: 42,
    rating: "9.4",
    description:
      "A quiet botanist discovers that the flowers in her rooftop garden are receiving messages from a planet that vanished centuries ago.",
  },
  {
    id: "iron-koi",
    title: "The Iron Koi",
    author: "Ren Abe",
    genre: "Action",
    cover: "/covers/iron-koi.jpg",
    chapter: 68,
    rating: "9.1",
    description:
      "An exiled swordsman follows a spectral koi upstream, hoping it will lead him back to a city that has erased his name.",
  },
  {
    id: "afterglow",
    title: "Afterglow Avenue",
    author: "Emi Hara",
    genre: "Romance",
    cover: "/covers/afterglow.jpg",
    chapter: 24,
    rating: "9.6",
    description:
      "Two old friends have one summer to decide whether their seaside hometown is a place to leave or a reason to stay.",
  },
  {
    id: "fox-moon",
    title: "Fox of the Ninth Moon",
    author: "Aya Mori",
    genre: "Fantasy",
    cover: "/covers/fox-moon.jpg",
    chapter: 51,
    rating: "9.3",
    description:
      "At a forgotten mountain shrine, a young keeper bargains with a fox spirit to return the moon to the night sky.",
  },
  {
    id: "rookie-zero",
    title: "Rookie Zero",
    author: "Jun Nakano",
    genre: "Sports",
    cover: "/covers/rookie-zero.jpg",
    chapter: 37,
    rating: "8.9",
    description:
      "A fearless streetball player joins the lowest-ranked school team and promises to rebuild it one impossible shot at a time.",
  },
  {
    id: "city-static",
    title: "City Static",
    author: "Toru Watanabe",
    genre: "Mystery",
    cover: "/covers/city-static.jpg",
    chapter: 19,
    rating: "9.2",
    description:
      "Every radio in Tokyo broadcasts the same unsolved crime at midnight. A rookie detective is the only person who hears a new clue.",
  },
  {
    id: "kitchen-gods",
    title: "Kitchen Gods",
    author: "Mika Sato",
    genre: "Comedy",
    cover: "/covers/kitchen-gods.jpg",
    chapter: 73,
    rating: "8.8",
    description:
      "A struggling ramen chef inherits a tiny restaurant and its very opinionated household spirits.",
  },
  {
    id: "last-signal",
    title: "The Last Signal",
    author: "Kei Nomura",
    genre: "Sci-fi",
    cover: "/covers/last-signal.jpg",
    chapter: 12,
    rating: "9.0",
    description:
      "On an empty world beyond the mapped stars, a lone surveyor receives a radio call from someone claiming to be on Earth.",
  },
];

const updates = [
  { manga: manga[0], chapter: "Ch. 42", time: "38 min ago", fresh: true },
  { manga: manga[3], chapter: "Ch. 51", time: "2h ago", fresh: true },
  { manga: manga[5], chapter: "Ch. 19", time: "4h ago", fresh: true },
  { manga: manga[1], chapter: "Ch. 68", time: "7h ago", fresh: false },
  { manga: manga[6], chapter: "Ch. 73", time: "12h ago", fresh: false },
  { manga: manga[4], chapter: "Ch. 37", time: "Yesterday", fresh: false },
  { manga: manga[2], chapter: "Ch. 24", time: "Yesterday", fresh: false },
  { manga: manga[7], chapter: "Ch. 12", time: "2 days ago", fresh: false },
];

const genres = ["All", "Action", "Comedy", "Fantasy", "Mystery", "Romance", "Sci-fi", "Sports"];

/* ────────── Reusable Components ────────── */

function ThemeToggle({ dark, toggle }: { dark: boolean; toggle: () => void }) {
  return (
    <motion.button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-secondary)] transition-all hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      whileTap={{ scale: 0.9 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {dark ? (
          <motion.span key="sun" initial={{ opacity: 0, rotate: -90, scale: 0 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0, rotate: 90, scale: 0 }} transition={{ duration: 0.2 }}>
            <Sun className="h-4 w-4" />
          </motion.span>
        ) : (
          <motion.span key="moon" initial={{ opacity: 0, rotate: 90, scale: 0 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0, rotate: -90, scale: 0 }} transition={{ duration: 0.2 }}>
            <Moon className="h-4 w-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function AppLogo() {
  return (
    <a className="group flex items-center gap-2" href="#top" aria-label="Mori home">
      <span className="grid h-7 w-7 grid-cols-2 gap-[2px] rounded-[5px] bg-[var(--accent)] p-[4px] transition-transform duration-200 group-hover:scale-105">
        <span className="rounded-[1px] bg-white" />
        <span className="rounded-[1px] bg-white/60" />
        <span className="col-span-2 rounded-[1px] bg-white" />
      </span>
      <span className="text-[18px] font-black tracking-[-0.04em] text-[var(--text-primary)]">MORI</span>
    </a>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 text-[12px] font-medium text-[var(--text-secondary)] transition-all hover:scale-[1.02] hover:border-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
    >
      {children}
    </a>
  );
}

/* ────────── Spotlight Hero ────────── */

function SpotlightHero({
  item,
  saved,
  onOpen,
  onSave,
}: {
  item: Manga;
  saved: boolean;
  onOpen: () => void;
  onSave: () => void;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group relative overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[0_1px_3px_var(--shadow-color)]"
    >
      <div className="grid items-stretch md:grid-cols-[200px_1fr] lg:grid-cols-[220px_1fr]">
        {/* Cover */}
        <button
          onClick={onOpen}
          className="relative aspect-[2/3] overflow-hidden bg-[var(--bg-surface-alt)] md:aspect-auto md:min-h-[280px] focus-visible:outline-none"
          aria-label={`Open ${item.title}`}
        >
          <img src={item.cover} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-black/10" />
        </button>

        {/* Info */}
        <div className="flex flex-col justify-center gap-4 p-5 sm:p-6 lg:p-8">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
              Editor's pick
            </span>
            <span className="flex items-center gap-1 text-[12px] font-medium text-[var(--text-tertiary)]">
              <Star className="h-3 w-3 fill-current text-amber-500" /> {item.rating}
            </span>
          </div>

          <div>
            <h2 className="text-[22px] font-bold leading-7 tracking-[-0.02em] text-[var(--text-primary)] sm:text-[26px] sm:leading-8">
              {item.title}
            </h2>
            <p className="mt-1 text-[13px] text-[var(--text-tertiary)]">
              {item.author} · {item.genre} · {item.chapter} chapters
            </p>
          </div>

          <p className="line-clamp-2 max-w-md text-[14px] leading-6 text-[var(--text-secondary)]">
            {item.description}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={onOpen}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-[var(--btn-bg)] px-4 text-[13px] font-semibold text-[var(--btn-text)] shadow-[0_1px_2px_var(--shadow-color)] transition-all hover:scale-[1.02] hover:bg-[var(--btn-bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <BookOpen className="h-3.5 w-3.5" /> Start reading
            </button>
            <button
              onClick={onSave}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 text-[13px] font-medium text-[var(--text-primary)] transition-all hover:bg-[var(--bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <Bookmark className="h-3.5 w-3.5" fill={saved ? "currentColor" : "none"} />
              {saved ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ────────── Compact Card ────────── */

function CompactCard({
  item,
  index,
  saved,
  onOpen,
  onSave,
}: {
  item: Manga;
  index: number;
  saved: boolean;
  onOpen: () => void;
  onSave: () => void;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: "easeOut" }}
      className="group min-w-0"
    >
      <div className="relative overflow-hidden rounded-lg bg-[var(--bg-surface-alt)]">
        <button
          className="block aspect-[2/3] w-full cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
          onClick={onOpen}
          aria-label={`Open ${item.title}`}
        >
          <img
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            src={item.cover}
            alt={`${item.title}`}
          />
        </button>
        {/* Bookmark pill */}
        <button
          className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--bookmark-bg)]/90 text-[var(--text-primary)] shadow-[0_1px_4px_var(--bookmark-shadow)] backdrop-blur-sm transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          onClick={onSave}
          aria-label={saved ? `Unsave ${item.title}` : `Save ${item.title}`}
        >
          <Bookmark className="h-3.5 w-3.5" fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="px-0.5 pt-2.5 pb-1">
        <button
          onClick={onOpen}
          className="line-clamp-1 w-full text-left text-[13px] font-semibold leading-5 text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)] focus-visible:outline-none"
        >
          {item.title}
        </button>
        <p className="mt-0.5 flex items-center justify-between text-[11px] leading-4 text-[var(--text-tertiary)]">
          <span>{item.genre}</span>
          <span className="flex items-center gap-0.5">
            <Star className="h-2.5 w-2.5 fill-current text-amber-500" /> {item.rating}
          </span>
        </p>
      </div>
    </motion.article>
  );
}

/* ────────── Horizontal Scroll Row ────────── */

function ScrollRow({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => {
    ref.current?.scrollBy({ left: dir * 260, behavior: "smooth" });
  };
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-[15px] font-bold text-[var(--text-primary)]">
          {icon} {title}
        </h3>
        <div className="flex gap-1">
          <button onClick={() => scroll(-1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-tertiary)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]" aria-label="Scroll left">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => scroll(1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-tertiary)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]" aria-label="Scroll right">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div ref={ref} className="scrollbar-hide -mx-1 flex gap-3 overflow-x-auto px-1 pb-2 scroll-smooth">
        {children}
      </div>
    </div>
  );
}

/* ────────── Chapter List Component ────────── */

function ChapterList({
  manga: m,
  onSelectChapter,
}: {
  manga: Manga;
  onSelectChapter: (ch: number) => void;
}) {
  const [sortAsc, setSortAsc] = useState(false);
  const chapters = useMemo(() => {
    const list = Array.from({ length: m.chapter }, (_, i) => i + 1);
    return sortAsc ? list : [...list].reverse();
  }, [m.chapter, sortAsc]);

  // Generate fake dates for chapters
  const chDate = (ch: number) => {
    const daysAgo = (m.chapter - ch) * 7 + Math.floor(Math.random() * 3);
    if (daysAgo === 0) return "Today";
    if (daysAgo === 1) return "Yesterday";
    if (daysAgo < 7) return `${daysAgo}d ago`;
    if (daysAgo < 30) return `${Math.floor(daysAgo / 7)}w ago`;
    return `${Math.floor(daysAgo / 30)}mo ago`;
  };

  return (
    <div className="flex flex-col">
      {/* Header row */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--dialog-bg)] px-4 py-2.5">
        <span className="text-[13px] font-semibold text-[var(--text-primary)]">{m.chapter} Chapters</span>
        <button
          onClick={() => setSortAsc((v) => !v)}
          className="flex items-center gap-1 rounded-md border border-[var(--border)] px-2 py-1 text-[11px] font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
        >
          <List className="h-3 w-3" />
          {sortAsc ? "Oldest first" : "Newest first"}
        </button>
      </div>

      {/* Chapter rows */}
      <div className="max-h-[320px] overflow-y-auto overscroll-contain">
        {chapters.map((ch) => (
          <button
            key={ch}
            onClick={() => onSelectChapter(ch)}
            className="group flex w-full items-center gap-3 border-b border-[var(--border)] px-4 py-2.5 text-left transition-colors hover:bg-[var(--bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)]"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--bg-surface-alt)] text-[11px] font-bold text-[var(--text-muted)] transition-colors group-hover:bg-[var(--accent)] group-hover:text-white">
              {ch}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-medium text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">
                Chapter {ch}
              </span>
              <span className="text-[11px] text-[var(--text-tertiary)]">{chDate(ch)}</span>
            </span>
            <Eye className="h-3.5 w-3.5 shrink-0 text-[var(--text-tertiary)] opacity-0 transition group-hover:opacity-100" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ────────── Reader View ────────── */

function ReaderView({
  manga: m,
  chapter,
  onClose,
  onChangeChapter,
}: {
  manga: Manga;
  chapter: number;
  onClose: () => void;
  onChangeChapter: (ch: number) => void;
}) {
  // Generate placeholder panels for the chapter
  const panelCount = 6 + (chapter % 4);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex flex-col bg-[var(--bg-page)]"
    >
      {/* Reader header */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-[var(--border)] bg-[var(--header-bg)] px-3 backdrop-blur-md">
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-primary)] transition hover:bg-[var(--bg-hover)]"
          aria-label="Close reader"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-[13px] font-semibold text-[var(--text-primary)]">{m.title}</p>
          <p className="text-[11px] text-[var(--text-tertiary)]">Chapter {chapter}</p>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-primary)] transition hover:bg-[var(--bg-hover)]"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      {/* Reader content */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto max-w-[720px] px-2 py-6 sm:px-4">
          {/* Chapter heading */}
          <div className="mb-6 text-center">
            <h2 className="text-[20px] font-bold text-[var(--text-primary)]">Chapter {chapter}</h2>
            <p className="mt-1 text-[13px] text-[var(--text-tertiary)]">{m.title} · by {m.author}</p>
          </div>

          {/* Simulated manga panels */}
          <div className="flex flex-col gap-1">
            {Array.from({ length: panelCount }, (_, i) => {
              const isWide = i % 3 === 0;
              const hue = ((chapter * 37 + i * 53) % 360);
              return (
                <div
                  key={i}
                  className="relative w-full overflow-hidden rounded-sm"
                  style={{ aspectRatio: isWide ? "16/10" : "4/5" }}
                >
                  {/* Use the manga cover as base with overlay variations */}
                  <img
                    src={m.cover}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{
                      filter: `hue-rotate(${hue}deg) saturate(${0.6 + (i % 3) * 0.3})`,
                      objectPosition: `${20 + (i * 15) % 60}% ${10 + (i * 20) % 80}%`,
                    }}
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      background: `linear-gradient(${135 + i * 30}deg, rgba(0,0,0,0.15), rgba(0,0,0,0.35))`,
                    }}
                  >
                    <span className="rounded-full bg-white/20 px-3 py-1 text-[12px] font-bold text-white backdrop-blur-sm">
                      Page {i + 1}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* End of chapter */}
          <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5 text-center">
            <p className="text-[14px] font-bold text-[var(--text-primary)]">End of Chapter {chapter}</p>
            <p className="mt-1 text-[12px] text-[var(--text-tertiary)]">
              {chapter < m.chapter ? "Continue to the next chapter" : "You're all caught up!"}
            </p>
            <div className="mt-4 flex justify-center gap-2">
              {chapter > 1 && (
                <button
                  onClick={() => onChangeChapter(chapter - 1)}
                  className="flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 text-[12px] font-semibold text-[var(--text-primary)] transition hover:bg-[var(--bg-hover)]"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Prev
                </button>
              )}
              {chapter < m.chapter && (
                <button
                  onClick={() => onChangeChapter(chapter + 1)}
                  className="flex h-9 items-center gap-1.5 rounded-lg bg-[var(--btn-bg)] px-4 text-[12px] font-semibold text-[var(--btn-text)] transition hover:bg-[var(--btn-bg-hover)]"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reader bottom nav */}
      <footer className="flex h-11 shrink-0 items-center justify-between border-t border-[var(--border)] bg-[var(--header-bg)] px-3 backdrop-blur-md">
        <button
          onClick={() => chapter > 1 && onChangeChapter(chapter - 1)}
          disabled={chapter <= 1}
          className="flex h-8 items-center gap-1 rounded-lg px-2 text-[12px] font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Prev
        </button>
        <span className="text-[12px] font-semibold text-[var(--text-primary)]">
          {chapter} / {m.chapter}
        </span>
        <button
          onClick={() => chapter < m.chapter && onChangeChapter(chapter + 1)}
          disabled={chapter >= m.chapter}
          className="flex h-8 items-center gap-1 rounded-lg px-2 text-[12px] font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:hover:bg-transparent"
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </footer>
    </motion.div>
  );
}

/* ────────── Admin Login Modal ────────── */

const ADMIN_PASSWORD =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_ADMIN_PASSWORD) ||
  "mori2024";

function AdminLogin({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onSuccess();
      onClose();
    } else {
      setError("Password salah");
      setPassword("");
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[var(--overlay)] p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => { if (e.currentTarget === e.target) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-[360px] overflow-hidden rounded-2xl bg-[var(--dialog-bg)] shadow-[0_8px_32px_var(--dialog-shadow)]"
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-[var(--accent)]" />
            <h3 className="text-[15px] font-bold text-[var(--text-primary)]">Admin Login</h3>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <p className="mb-3 text-[12px] text-[var(--text-tertiary)]">
            Masukkan password admin untuk mengelola konten manga.
          </p>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            placeholder="Password"
            className={`h-10 w-full rounded-lg border bg-[var(--bg-input)] px-3 text-[13px] text-[var(--text-primary)] outline-none transition focus:shadow-[0_0_0_3px_var(--accent-ring)] ${
              error ? "border-red-500" : "border-[var(--border)] focus:border-[var(--accent)]"
            }`}
          />
          {error && <p className="mt-2 text-[12px] text-red-500">{error}</p>}
          <button
            type="submit"
            className="mt-4 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--btn-bg)] text-[13px] font-semibold text-[var(--btn-text)] transition hover:bg-[var(--btn-bg-hover)]"
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Masuk
          </button>
          <p className="mt-3 text-center text-[10px] text-[var(--text-tertiary)]">
            Default: <code className="rounded bg-[var(--bg-surface-alt)] px-1">mori2024</code>
          </p>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ────────── Admin Panel Modal ────────── */

function AdminPanel({
  userUploads,
  onClose,
  onLogout,
  onUpload,
  onDelete,
}: {
  userUploads: Manga[];
  onClose: () => void;
  onLogout: () => void;
  onUpload: (data: Omit<Manga, "id" | "rating" | "isUserUpload">) => void;
  onDelete: (id: string) => void;
}) {
  const [tab, setTab] = useState<"upload" | "manage">("upload");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-[var(--overlay)] p-0 sm:items-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => { if (e.currentTarget === e.target) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        className="flex max-h-[92vh] w-full max-w-[560px] flex-col overflow-hidden rounded-t-2xl bg-[var(--dialog-bg)] shadow-[0_8px_32px_var(--dialog-shadow)] sm:rounded-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)] text-white">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[var(--text-primary)]">Admin Panel</h3>
              <p className="text-[11px] text-[var(--text-tertiary)]">Kelola konten manga Anda</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onLogout}
              className="flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 text-[12px] font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              title="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
            <button onClick={onClose} className="rounded-full p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border)]">
          <button
            onClick={() => setTab("upload")}
            className={`relative flex-1 py-2.5 text-center text-[13px] font-medium transition-colors ${
              tab === "upload" ? "text-[var(--accent)]" : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Upload className="mr-1 inline h-3.5 w-3.5" /> Upload Baru
            {tab === "upload" && <motion.span layoutId="admin-tab" className="absolute inset-x-4 bottom-0 h-[2px] rounded-full bg-[var(--accent)]" />}
          </button>
          <button
            onClick={() => setTab("manage")}
            className={`relative flex-1 py-2.5 text-center text-[13px] font-medium transition-colors ${
              tab === "manage" ? "text-[var(--accent)]" : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Settings className="mr-1 inline h-3.5 w-3.5" /> Kelola ({userUploads.length})
            {tab === "manage" && <motion.span layoutId="admin-tab" className="absolute inset-x-4 bottom-0 h-[2px] rounded-full bg-[var(--accent)]" />}
          </button>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <AnimatePresence mode="wait" initial={false}>
            {tab === "upload" ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                <AdminUploadForm onUpload={onUpload} />
              </motion.div>
            ) : (
              <motion.div
                key="manage"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="p-4"
              >
                {userUploads.length === 0 ? (
                  <div className="py-12 text-center">
                    <BookOpen className="mx-auto mb-2 h-6 w-6 text-[var(--text-tertiary)]" />
                    <p className="text-[13px] text-[var(--text-secondary)]">Belum ada manga yang di-upload</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)]">
                    {userUploads.map((m) => (
                      <div key={m.id} className="flex items-center gap-3 p-2.5">
                        <img src={m.cover} alt="" className="h-14 w-10 shrink-0 rounded object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-semibold text-[var(--text-primary)]">{m.title}</p>
                          <p className="truncate text-[11px] text-[var(--text-tertiary)]">
                            {m.author} · {m.genre} · {m.chapter} ch{m.season ? ` · ${m.season}` : ""}
                          </p>
                        </div>
                        {confirmDelete === m.id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => { onDelete(m.id); setConfirmDelete(null); }}
                              className="h-7 rounded bg-red-500 px-2 text-[11px] font-semibold text-white transition hover:bg-red-600"
                            >
                              Hapus
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="h-7 rounded border border-[var(--border)] px-2 text-[11px] font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-hover)]"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(m.id)}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--text-tertiary)] transition hover:bg-red-500/10 hover:text-red-500"
                            title="Hapus manga"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ────────── Admin Upload Form (reuse di dalam panel) ────────── */

function AdminUploadForm({
  onUpload,
}: {
  onUpload: (data: Omit<Manga, "id" | "rating" | "isUserUpload">) => void;
}) {
  const [form, setForm] = useState({
    title: "",
    author: "",
    genre: "Action",
    season: "",
    description: "",
    chapter: 1,
    cover: "",
  });
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const genreList = ["Action", "Comedy", "Fantasy", "Mystery", "Romance", "Sci-fi", "Sports"];

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert("Ukuran gambar terlalu besar (maks 3MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setForm((f) => ({ ...f, cover: result }));
      setCoverPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.author || !form.description || !form.cover) {
      alert("Lengkapi semua field wajib dan upload cover.");
      return;
    }
    setSubmitting(true);
    await onUpload({
      title: form.title,
      author: form.author,
      genre: form.genre,
      season: form.season || undefined,
      description: form.description,
      chapter: form.chapter,
      cover: form.cover,
    });
    setForm({ title: "", author: "", genre: "Action", season: "", description: "", chapter: 1, cover: "" });
    setCoverPreview("");
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-5">
      <div className="grid gap-4">
        {/* Cover */}
        <div>
          <label className="mb-1.5 block text-[12px] font-semibold text-[var(--text-secondary)]">Cover Image *</label>
          <label className="group flex h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--bg-surface-alt)] text-center transition hover:border-[var(--accent)]">
            {coverPreview ? (
              <img src={coverPreview} alt="preview" className="h-full w-full rounded-[10px] object-cover" />
            ) : (
              <>
                <div className="mb-1.5 text-[var(--text-tertiary)]">📷</div>
                <span className="text-[13px] font-medium text-[var(--text-secondary)]">Klik untuk upload cover</span>
                <span className="text-[11px] text-[var(--text-tertiary)]">JPG/PNG, maks 3MB</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[var(--text-secondary)]">Judul *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Judul manga"
              className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-input)] px-3 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[var(--text-secondary)]">Author *</label>
            <input
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              placeholder="Nama author"
              className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-input)] px-3 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[var(--text-secondary)]">Genre</label>
            <select
              value={form.genre}
              onChange={(e) => setForm({ ...form, genre: e.target.value })}
              className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-input)] px-2 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            >
              {genreList.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[var(--text-secondary)]">Season</label>
            <input
              value={form.season}
              onChange={(e) => setForm({ ...form, season: e.target.value })}
              placeholder="S1 / Arc 2"
              className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-input)] px-3 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[var(--text-secondary)]">Chapters</label>
            <input
              type="number"
              min={1}
              value={form.chapter}
              onChange={(e) => setForm({ ...form, chapter: parseInt(e.target.value) || 1 })}
              className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-input)] px-3 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[12px] font-semibold text-[var(--text-secondary)]">Deskripsi *</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            placeholder="Deskripsi singkat cerita..."
            className="w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--btn-bg)] text-[13px] font-semibold text-[var(--btn-text)] transition hover:bg-[var(--btn-bg-hover)] disabled:opacity-60"
      >
        {submitting ? (
          <>
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Mengupload...
          </>
        ) : (
          <>
            <Plus className="h-3.5 w-3.5" /> Tambah Manga
          </>
        )}
      </button>
    </form>
  );
}

/* ────────── App ────────── */

export default function App() {
  const { dark, toggle } = useDarkMode();
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All");
  const [activeNav, setActiveNav] = useState("Discover");
  const [saved, setSaved] = useState<Set<string>>(new Set(["fox-moon"]));
  const [selected, setSelected] = useState<Manga | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeTransition, setThemeTransition] = useState(false);
  const [readingChapter, setReadingChapter] = useState<{ manga: Manga; chapter: number } | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userUploads, setUserUploads] = useState<Manga[]>([]);
  const [isLoadingUploads, setIsLoadingUploads] = useState(true);

  // Admin access via URL hash: yoursite.com/#admin
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === "#admin") {
        if (isAdmin) {
          setShowAdminPanel(true);
        } else {
          setShowAdminLogin(true);
        }
      }
    };
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, [isAdmin]);

  // Clear #admin hash when login/panel closes
  useEffect(() => {
    if (!showAdminLogin && !showAdminPanel && window.location.hash === "#admin") {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, [showAdminLogin, showAdminPanel]);

  // Fetch user-uploaded manga from Supabase
  useEffect(() => {
    const fetchUserManga = async () => {
      try {
        const { data, error } = await supabase
          .from("manga")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const formatted: Manga[] = (data as MangaRow[]).map((row) => ({
          id: row.id,
          title: row.title,
          author: row.author,
          genre: row.genre,
          season: row.season || undefined,
          cover: row.cover_url,
          chapter: row.chapter,
          rating: row.rating,
          description: row.description,
          isUserUpload: true,
        }));

        setUserUploads(formatted);
      } catch (err) {
        console.error("Failed to fetch manga from Supabase:", err);
      } finally {
        setIsLoadingUploads(false);
      }
    };

    fetchUserManga();
  }, []);

  const handleToggle = () => {
    setThemeTransition(true);
    toggle();
  };

  useEffect(() => {
    if (!themeTransition) return;
    const t = setTimeout(() => setThemeTransition(false), 400);
    return () => clearTimeout(t);
  }, [themeTransition]);

  // Merge default manga + user uploads
  const allManga = useMemo(() => [...manga, ...userUploads], [userUploads]);

  const filteredManga = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allManga.filter((item) => {
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q) ||
        item.genre.toLowerCase().includes(q);
      const matchGenre = genre === "All" || item.genre === genre;
      const matchLib = activeNav !== "Library" || saved.has(item.id);
      return matchSearch && matchGenre && matchLib;
    });
  }, [activeNav, genre, query, saved, allManga]);

  const filteredUpdates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return updates.filter(
      ({ manga: m }) => !q || m.title.toLowerCase().includes(q) || m.genre.toLowerCase().includes(q),
    );
  }, [query]);

  const toggleSaved = (id: string) => {
    setSaved((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const chooseNav = (label: string) => {
    setActiveNav(label);
    setMobileOpen(false);
    if (label === "Latest") {
      setTimeout(() => document.getElementById("latest")?.scrollIntoView({ behavior: "smooth" }), 0);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Upload new manga to Supabase
  const handleUploadManga = async (data: Omit<Manga, "id" | "rating" | "isUserUpload">) => {
    try {
      const rating = (8.5 + Math.random() * 1).toFixed(1);

      const { data: inserted, error } = await supabase
        .from("manga")
        .insert({
          title: data.title,
          author: data.author,
          genre: data.genre,
          season: data.season || null,
          description: data.description,
          chapter: data.chapter,
          cover_url: data.cover,
          rating,
        })
        .select()
        .single();

      if (error) throw error;

      const newManga: Manga = {
        id: inserted.id,
        title: inserted.title,
        author: inserted.author,
        genre: inserted.genre,
        season: inserted.season || undefined,
        cover: inserted.cover_url,
        chapter: inserted.chapter,
        rating: inserted.rating,
        description: inserted.description,
        isUserUpload: true,
      };

      setUserUploads((prev) => [newManga, ...prev]);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload gagal. Periksa koneksi Supabase dan struktur tabel.");
    }
  };

  // Delete manga from Supabase
  const handleDeleteManga = async (id: string) => {
    try {
      const { error } = await supabase.from("manga").delete().eq("id", id);
      if (error) throw error;
      setUserUploads((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Gagal menghapus manga.");
    }
  };

  // Featured manga for hero
  const hero = manga[2]; // Afterglow Avenue — highest rated

  return (
    <div
      id="top"
      className={`min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] ${themeTransition ? "theme-transition" : ""}`}
    >
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--header-bg)] backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-5 px-4 sm:px-6">
          <AppLogo />

          {/* Desktop nav */}
          <nav className="hidden h-full items-stretch md:flex" aria-label="Primary navigation">
            {["Discover", "Latest", "Library"].map((label) => (
              <button
                key={label}
                onClick={() => chooseNav(label)}
                className={`relative px-3 text-[13px] font-medium transition-colors hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)] ${
                  activeNav === label ? "font-bold text-[var(--accent)]" : "text-[var(--text-muted)]"
                }`}
              >
                {label}
                {activeNav === label && (
                  <motion.span layoutId="active-nav" className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-[var(--accent)]" />
                )}
              </button>
            ))}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Desktop search */}
          <div className="hidden w-full max-w-[280px] lg:block">
            <label className="relative block">
              <span className="sr-only">Search manga</span>
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-input)] pl-8 pr-8 text-[13px] text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)] focus:bg-[var(--bg-surface)] focus:shadow-[0_0_0_3px_var(--accent-ring)]"
                placeholder="Search..."
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)]" aria-label="Clear">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </label>
          </div>

          <ThemeToggle dark={dark} toggle={handleToggle} />

          {/* Mobile menu */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-primary)] transition hover:bg-[var(--bg-hover)] md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* Mobile search */}
        <div className="border-t border-[var(--border)] px-4 py-2 lg:hidden">
          <label className="relative block">
            <span className="sr-only">Search manga</span>
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-input)] pl-8 pr-8 text-[13px] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)] focus:bg-[var(--bg-surface)] focus:shadow-[0_0_0_3px_var(--accent-ring)]"
              placeholder="Search manga..."
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-[var(--text-tertiary)]" aria-label="Clear">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>
        </div>

        {/* Mobile nav dropdown */}
        <AnimatePresence initial={false}>
          {mobileOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-[var(--border)] bg-[var(--bg-surface)] md:hidden"
              aria-label="Mobile navigation"
            >
              <div className="grid px-4 py-1.5">
                {["Discover", "Latest", "Library"].map((label) => (
                  <button
                    key={label}
                    onClick={() => chooseNav(label)}
                    className={`flex min-h-10 items-center justify-between rounded px-3 text-left text-[14px] transition-colors hover:bg-[var(--bg-hover)] ${
                      activeNav === label ? "font-bold text-[var(--accent)]" : "text-[var(--text-primary)]"
                    }`}
                  >
                    {label}
                    {activeNav === label && <Check className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* ── Main ── */}
      <main className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-6">
        {/* ── Hero spotlight (Discover only) ── */}
        {activeNav === "Discover" && !query && (
          <div className="pt-6 sm:pt-8">
            <SpotlightHero
              item={hero}
              saved={saved.has(hero.id)}
              onOpen={() => setSelected(hero)}
              onSave={() => toggleSaved(hero.id)}
            />
          </div>
        )}

        {/* ── Genre chips ── */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-6 pb-1 scrollbar-hide sm:pt-8">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`shrink-0 rounded-full border px-3 py-1 text-[12px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                genre === g
                  ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                  : "border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* ── Section heading ── */}
        <div className="flex items-end justify-between pt-6">
          <h2 className="text-[16px] font-bold tracking-[-0.01em] text-[var(--text-primary)]">
            {activeNav === "Library" ? "Your library" : "Browse"}
          </h2>
          {activeNav !== "Library" && (
            <span className="text-[12px] text-[var(--text-tertiary)]">{filteredManga.length} titles</span>
          )}
        </div>

          {/* ── Card grid ── */}
          {isLoadingUploads ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" />
            </div>
          ) : filteredManga.length ? (
          <div className="grid grid-cols-3 gap-x-3 gap-y-5 pt-4 min-[520px]:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:gap-x-4">
            {filteredManga.map((item, i) => (
              <CompactCard
                key={item.id}
                item={item}
                index={i}
                saved={saved.has(item.id)}
                onOpen={() => setSelected(item)}
                onSave={() => toggleSaved(item.id)}
              />
            ))}
          </div>
        ) : (
           <div className="py-16 text-center">
             <BookOpen className="mx-auto mb-3 h-6 w-6 text-[var(--text-tertiary)]" />
             <p className="text-[14px] font-semibold text-[var(--text-primary)]">Nothing here yet</p>
             <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
               {activeNav === "Library" ? "Bookmark a manga to see it here." : "Try a different search or genre."}
             </p>
             <button
               className="mt-4 h-8 rounded-lg bg-[var(--btn-bg)] px-3.5 text-[12px] font-semibold text-[var(--btn-text)] transition hover:bg-[var(--btn-bg-hover)]"
               onClick={() => { setQuery(""); setGenre("All"); setActiveNav("Discover"); }}
             >
               Browse all
             </button>
           </div>
         )}

        {/* ── Popular row (horizontal scroll) ── */}
        {activeNav !== "Library" && !query && (
          <div className="pt-10">
            <ScrollRow title="Popular this week" icon={<Flame className="h-4 w-4 text-[var(--accent)]" />}>
              {[allManga[2], allManga[0], allManga[5], allManga[3], allManga[6], allManga[1], allManga[7], allManga[4]].map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className="group flex w-[140px] shrink-0 flex-col focus-visible:outline-none"
                >
                  <div className="overflow-hidden rounded-lg bg-[var(--bg-surface-alt)]">
                    <img
                      src={item.cover}
                      alt={item.title}
                      className="aspect-[2/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                  </div>
                  <span className="mt-2 line-clamp-1 text-left text-[12px] font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">
                    {String(i + 1).padStart(2, "0")}. {item.title}
                  </span>
                  <span className="text-left text-[11px] text-[var(--text-tertiary)]">{item.genre}</span>
                </button>
              ))}
            </ScrollRow>
          </div>
        )}

        {/* ── Latest chapters ── */}
        {activeNav !== "Library" && (
          <section id="latest" className="scroll-mt-32 pt-10" aria-labelledby="latest-heading">
            <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
              {/* Update list */}
              <div>
                <h2 id="latest-heading" className="mb-3 text-[16px] font-bold text-[var(--text-primary)]">
                  Latest updates
                </h2>
                <div className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-[var(--card-bg)]">
                  {filteredUpdates.map((u, i) => (
                    <motion.div
                      key={u.manga.id}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.03 }}
                      className="group flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-[var(--bg-hover)]"
                    >
                      <button
                        onClick={() => setSelected(u.manga)}
                        className="h-14 w-10 shrink-0 overflow-hidden rounded bg-[var(--bg-surface-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                        aria-label={`Open ${u.manga.title}`}
                      >
                        <img src={u.manga.cover} alt="" className="h-full w-full object-cover" />
                      </button>
                      <div className="min-w-0 flex-1">
                        <button
                          onClick={() => setSelected(u.manga)}
                          className="block truncate text-left text-[13px] font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)] focus-visible:outline-none"
                        >
                          {u.manga.title}
                        </button>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[var(--text-tertiary)]">
                          <span className="font-medium text-[var(--text-muted)]">{u.chapter}</span>
                          <span className="flex items-center gap-0.5"><Clock3 className="h-2.5 w-2.5" /> {u.time}</span>
                          {u.fresh && (
                            <span className="rounded bg-[var(--accent)] px-1.5 py-px text-[10px] font-bold text-white">NEW</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSaved(u.manga.id)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--text-tertiary)] transition hover:bg-[var(--bg-active)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                        aria-label={saved.has(u.manga.id) ? "Unsave" : "Save"}
                      >
                        <Bookmark className="h-3.5 w-3.5" fill={saved.has(u.manga.id) ? "currentColor" : "none"} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>

                {/* Trending sidebar */}
              <aside>
                <h3 className="mb-3 flex items-center gap-1.5 text-[15px] font-bold text-[var(--text-primary)]">
                  <Flame className="h-4 w-4 text-[var(--accent)]" /> Trending
                </h3>
                <div className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-[var(--card-bg)]">
                  {[allManga[2], allManga[0], allManga[5], allManga[3], allManga[6]].map((item, i) => (
                    <button
                      key={item.id}
                      onClick={() => setSelected(item)}
                      className="group flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[var(--bg-hover)] focus-visible:outline-none"
                    >
                      <span className={`w-5 shrink-0 text-[14px] font-black ${i === 0 ? "text-[var(--accent)]" : "text-[var(--text-tertiary)]"}`}>
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">
                          {item.title}
                        </span>
                        <span className="text-[11px] text-[var(--text-tertiary)]">{item.genre} · Ch. {item.chapter}</span>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[var(--text-tertiary)] opacity-0 transition-all group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </aside>
            </div>
          </section>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--border)] bg-[var(--bg-surface)]">
        <div className="mx-auto max-w-[1200px] px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1.5 text-[12px] text-[var(--text-tertiary)]">
              <span className="font-black text-[var(--text-primary)]">MORI</span>
              <span>· Independent stories, easy to find.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden text-[12px] text-[var(--text-tertiary)] sm:inline">Follow us</span>
              <SocialLink href="https://x.com" label="X (Twitter)">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>X</span>
              </SocialLink>
              <SocialLink href="https://threads.net" label="Threads">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                  <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.432 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.18.408-2.26 1.33-3.042.886-.752 2.128-1.205 3.595-1.311.99-.071 1.913-.008 2.768.19-.08-.894-.332-1.592-.76-2.086-.567-.656-1.478-.99-2.708-.995h-.03c-.976 0-2.378.27-3.259 1.435l-1.655-1.252c1.032-1.363 2.733-2.134 4.915-2.134h.056c1.858.013 3.293.59 4.26 1.717.864 1.005 1.325 2.42 1.37 4.205.41.213.793.458 1.147.734 1.038.808 1.812 1.823 2.3 3.014.793 1.945.856 4.64-1.425 6.874-1.847 1.808-4.11 2.613-7.318 2.636zm.263-9.93c-.296 0-.6.01-.91.032-1.887.135-3.065.963-2.987 2.107.065.96 1.113 1.562 2.516 1.462 1.866-.133 2.777-.985 3.03-2.845-.52-.18-1.083-.27-1.65-.27z" />
                </svg>
                <span>Threads</span>
              </SocialLink>
              <SocialLink href="https://t.me" label="Telegram">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
                <span>Telegram</span>
              </SocialLink>
            </div>
          </div>
          <div className="mt-3 border-t border-[var(--border)] pt-3 text-[11px] text-[var(--text-tertiary)]">
            © {new Date().getFullYear()} MORI · New chapters every day
          </div>
        </div>
      </footer>

      {/* ── Detail Dialog ── */}
      <AnimatePresence>
        {selected && (
          <DetailDialog
            selected={selected}
            saved={saved}
            onClose={() => setSelected(null)}
            onToggleSave={() => toggleSaved(selected.id)}
            onReadChapter={(ch) => {
              setReadingChapter({ manga: selected, chapter: ch });
              setSelected(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Reader View ── */}
      <AnimatePresence>
        {readingChapter && (
          <ReaderView
            manga={readingChapter.manga}
            chapter={readingChapter.chapter}
            onClose={() => setReadingChapter(null)}
            onChangeChapter={(ch) =>
              setReadingChapter((prev) => (prev ? { ...prev, chapter: ch } : null))
            }
          />
        )}
      </AnimatePresence>

      {/* ── Admin Login ── */}
      <AnimatePresence>
        {showAdminLogin && (
          <AdminLogin
            onClose={() => setShowAdminLogin(false)}
            onSuccess={() => {
              setIsAdmin(true);
              setShowAdminPanel(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Admin Panel ── */}
      <AnimatePresence>
        {showAdminPanel && isAdmin && (
          <AdminPanel
            userUploads={userUploads}
            onClose={() => setShowAdminPanel(false)}
            onLogout={() => {
              setIsAdmin(false);
              setShowAdminPanel(false);
            }}
            onUpload={handleUploadManga}
            onDelete={handleDeleteManga}
          />
        )}
      </AnimatePresence>

    </div>
  );
}

/* ────────── Detail Dialog (extracted) ────────── */

function DetailDialog({
  selected,
  saved,
  onClose,
  onToggleSave,
  onReadChapter,
}: {
  selected: Manga;
  saved: Set<string>;
  onClose: () => void;
  onToggleSave: () => void;
  onReadChapter: (ch: number) => void;
}) {
  const [tab, setTab] = useState<"about" | "chapters">("about");

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--overlay)] p-0 sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => { if (e.currentTarget === e.target) onClose(); }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="manga-title"
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        className="relative flex max-h-[92vh] w-full max-w-[720px] flex-col overflow-hidden rounded-t-xl bg-[var(--dialog-bg)] shadow-[0_8px_24px_var(--dialog-shadow)] sm:rounded-xl"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bookmark-bg)]/80 text-[var(--text-primary)] backdrop-blur-sm transition-all hover:scale-110 hover:bg-[var(--bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Top: cover + info */}
        <div className="grid shrink-0 sm:grid-cols-[200px_1fr]">
          <div className="max-h-[320px] overflow-hidden bg-[var(--bg-surface-alt)] sm:max-h-none sm:rounded-tl-xl">
            <img className="h-full w-full object-cover" src={selected.cover} alt={selected.title} />
          </div>
          <div className="flex flex-col gap-3 p-5 sm:p-5">
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="rounded-full bg-[var(--badge-bg)] px-2 py-0.5 text-[11px] font-semibold text-[var(--badge-text)]">
                  {selected.genre}
                </span>
                <span className="flex items-center gap-0.5 text-[12px] text-[var(--text-tertiary)]">
                  <Star className="h-3 w-3 fill-current text-amber-500" /> {selected.rating}
                </span>
              </div>
              <h2 id="manga-title" className="pr-8 text-[20px] font-bold leading-7 tracking-[-0.02em] text-[var(--text-primary)] sm:text-[22px]">
                {selected.title}
              </h2>
              <p className="mt-0.5 text-[12px] text-[var(--text-tertiary)]">by {selected.author}</p>
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onReadChapter(1)}
                className="flex h-8 items-center gap-1.5 rounded-lg bg-[var(--btn-bg)] px-3.5 text-[12px] font-semibold text-[var(--btn-text)] transition hover:bg-[var(--btn-bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                <BookOpen className="h-3.5 w-3.5" /> Read Ch. 1
              </button>
              <button
                onClick={() => onReadChapter(selected.chapter)}
                className="flex h-8 items-center gap-1.5 rounded-lg border border-[var(--accent)] bg-transparent px-3 text-[12px] font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                Latest Ch. {selected.chapter}
              </button>
              <button
                onClick={onToggleSave}
                className="flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 text-[12px] font-medium text-[var(--text-primary)] transition hover:bg-[var(--bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                <Bookmark className="h-3.5 w-3.5" fill={saved.has(selected.id) ? "currentColor" : "none"} />
                {saved.has(selected.id) ? "Saved" : "Save"}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex shrink-0 border-y border-[var(--border)]">
          {(["about", "chapters"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative flex-1 py-2.5 text-center text-[13px] font-medium transition-colors focus-visible:outline-none ${
                tab === t
                  ? "text-[var(--accent)]"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {t === "about" ? "About" : `Chapters (${selected.chapter})`}
              {tab === t && (
                <motion.span
                  layoutId="dialog-tab"
                  className="absolute inset-x-4 bottom-0 h-[2px] rounded-full bg-[var(--accent)]"
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <AnimatePresence mode="wait" initial={false}>
            {tab === "about" ? (
              <motion.div
                key="about"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="p-5"
              >
                <p className="text-[14px] leading-6 text-[var(--text-secondary)]">{selected.description}</p>

                <div className="mt-5 flex items-center gap-5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface-alt)] px-4 py-3 text-center text-[12px]">
                  <div>
                    <strong className="block text-[16px] text-[var(--text-primary)]">{selected.chapter}</strong>
                    <span className="text-[var(--text-tertiary)]">Chapters</span>
                  </div>
                  <span className="h-6 w-px bg-[var(--border)]" />
                  <div>
                    <strong className="block text-[16px] text-[var(--text-primary)]">{selected.rating}</strong>
                    <span className="text-[var(--text-tertiary)]">Score</span>
                  </div>
                  <span className="h-6 w-px bg-[var(--border)]" />
                  <div>
                    <strong className="block text-[16px] text-[var(--text-primary)]">{selected.genre}</strong>
                    <span className="text-[var(--text-tertiary)]">Genre</span>
                  </div>
                </div>

              </motion.div>
            ) : (
              <motion.div
                key="chapters"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
              >
                <ChapterList manga={selected} onSelectChapter={onReadChapter} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
