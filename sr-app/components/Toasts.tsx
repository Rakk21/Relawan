"use client";
import { useEffect, useRef, useState } from "react";

export type ToastKind = "success" | "error" | "warning" | "info";
export type Toast = { id: number; title: string; desc?: string; kind: ToastKind };

const KIND: Record<ToastKind, { icon: string; bar: string; ring: string; iconBg: string }> = {
  success: { icon: "✓", bar: "bg-emerald-500", ring: "border-emerald-200 dark:border-emerald-800", iconBg: "bg-emerald-500" },
  error: { icon: "!", bar: "bg-rose-500", ring: "border-rose-200 dark:border-rose-800", iconBg: "bg-rose-500" },
  warning: { icon: "◐", bar: "bg-amber-500", ring: "border-amber-200 dark:border-amber-800", iconBg: "bg-amber-500" },
  info: { icon: "✦", bar: "bg-blue-500", ring: "border-blue-200 dark:border-blue-800", iconBg: "bg-blue-500" },
};

const DURATION = 4800;

function ToastItem({ toast, onDone }: { toast: Toast; onDone: (id: number) => void }) {
  const [leaving, setLeaving] = useState(false);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const k = KIND[toast.kind];

  useEffect(() => {
    if (paused) return;
    timer.current = setTimeout(() => {
      setLeaving(true);
      setTimeout(() => onDone(toast.id), 280);
    }, DURATION);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [paused, toast.id, onDone]);

  return (
    <div
      role="status"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={`toast-enter ${leaving ? "toast-leave" : ""} pointer-events-auto w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-2xl border ${k.ring} bg-white/90 dark:bg-[#0F172A]/90 shadow-[0_16px_48px_rgba(15,23,42,0.18)] backdrop-blur-xl`}
    >
      <div className="flex items-start gap-3 px-3.5 py-3">
        <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${k.iconBg} text-[14px] font-black text-white shadow`}>
          {k.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-extrabold leading-tight text-[#0F172A] dark:text-white">{toast.title}</div>
          {toast.desc && (
            <div className="mt-0.5 line-clamp-3 text-[12px] leading-snug text-[#64748B] dark:text-[#94A3B8]">{toast.desc}</div>
          )}
        </div>
        <button
          aria-label="Tutup notifikasi"
          onClick={() => { setLeaving(true); setTimeout(() => onDone(toast.id), 280); }}
          className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[12px] text-[#94A3AF] transition hover:bg-slate-100 hover:text-[#334155] dark:hover:bg-white/10 dark:hover:text-white"
        >
          ✕
        </button>
      </div>
      {!paused ? (
        <div className="h-[3px] bg-slate-100 dark:bg-white/10">
          <div className={`toast-progress-bar h-full ${k.bar}`} style={{ animationDuration: `${DURATION}ms` }} />
        </div>
      ) : (
        <div className="h-[3px] bg-slate-100 dark:bg-white/10">
          <div className={`h-full ${k.bar} opacity-40`} style={{ width: "100%" }} />
        </div>
      )}
    </div>
  );
}

export function ToastStack({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  if (!toasts.length) return null;
  return (
    <div aria-live="polite" className="pointer-events-none fixed right-3 top-[68px] z-[80] flex flex-col items-end gap-2 sm:right-4">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDone={dismiss} />
      ))}
    </div>
  );
}
