"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("wedplan-theme");
    const dark = saved
      ? saved === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;

    document.documentElement.classList.toggle("dark", dark);
    queueMicrotask(() => {
      setIsDark(dark);
      setMounted(true);
    });
  }, []);

  function toggleTheme() {
    const next = !isDark;

    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("wedplan-theme", next ? "dark" : "light");
  }

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      whileHover={{ rotate: 15, scale: 1.1 }}
      whileTap={{ scale: 0.88 }}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-card/80 text-primary shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-accent hover:shadow-lg"
    >
      {mounted && (
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isDark ? "moon" : "sun"}
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.25 }}
          >
            {isDark ? <Moon size={19} /> : <Sun size={19} />}
          </motion.span>
        </AnimatePresence>
      )}
    </motion.button>
  );
}
