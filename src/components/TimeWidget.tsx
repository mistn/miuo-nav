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

  return <span className="text-sm text-slate-600 dark:text-slate-400 tabular-nums">{h}:{m}</span>;
}
