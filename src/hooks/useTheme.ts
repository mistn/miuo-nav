/**
 * useTheme.ts — 主题切换 Hook
 *
 * 【修复说明】
 * 简化实现，确保切换可靠工作。
 * 不再依赖系统偏好，直接从 localStorage 读取或默认为 light。
 */

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "navidash-theme";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  // 优先从 localStorage 读取
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "dark") return "dark";
  if (saved === "light") return "light";
  // 默认亮色（不跟随系统，避免混淆）
  return "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // 当 theme 变化时，同步到 <html> class 和 localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem(STORAGE_KEY, theme);
    console.log("Theme changed to:", theme, "html classes:", root.className);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      console.log("Toggle theme:", prev, "->", next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
