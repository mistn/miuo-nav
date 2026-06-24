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

  return <span className="text-sm text-slate-900 font-medium [text-shadow:_0_1px_2px_rgb(255_255_255_/_80%)] dark:text-white dark:[text-shadow:_0_1px_2px_rgb(0_0_0_/_80%)] tabular-nums header-text">{h}:{m}</span>;
}
