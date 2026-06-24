/**
 * TimeWidget.tsx — 时间组件（支持暗色模式）
 */

import { useState, useEffect } from "react";

export function TimeWidget() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const h = now.getHours().toString().padStart(2, "0");
  const m = now.getMinutes().toString().padStart(2, "0");

  return <span className="text-sm text-slate-800 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] dark:text-zinc-100 dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tabular-nums header-text">{h}:{m}</span>;
}
