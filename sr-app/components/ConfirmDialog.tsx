"use client";
import { useEffect, useRef } from "react";

export type PendingAction = {
  kind: "relawan" | "koor" | "tps" | "reset";
  id?: string;
  heading: string;
  desc: string;
  chips: string[];
  confirmLabel?: string;
};

export function ConfirmDialog({ open, heading, desc, chips, confirmLabel = "Ya, Hapus", tone = "danger", onConfirm, onCancel }: {
  open: boolean;
  heading: string;
  desc: string;
  chips: string[];
  confirmLabel?: string;
  tone?: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => cancelRef.current?.focus(), 90);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
      // Enter = konfirmasi, kecuali fokus sedang di tombol (biar tidak double-fire)
      if (e.key === "Enter" && !(document.activeElement instanceof HTMLButtonElement)) onConfirm();
    }
    document.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); document.removeEventListener("keydown", onKey); };
  }, [open, onCancel, onConfirm]);

  if (!open) return null;
  const danger = tone === "danger";

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label={heading}
      onClick={onCancel}
      className="modal-overlay fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-pop w-full max-w-sm overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white shadow-[0_32px_80px_rgba(15,23,42,0.35)] dark:border-[#334155] dark:bg-[#1E293B]"
      >
        <div className="flex flex-col items-center px-5 pt-6 text-center">
          <span className={`modal-icon-ring grid h-14 w-14 place-items-center rounded-full text-[22px] text-white ${danger ? "bg-gradient-to-br from-rose-500 to-red-600" : "bg-gradient-to-br from-amber-500 to-orange-600"}`}>
            {danger ? "🗑" : "⚠"}
          </span>
          <h3 className="mt-3 text-[16px] font-extrabold text-[#0F172A] dark:text-white">{heading}</h3>
          <p className="mt-1 text-[12px] leading-relaxed text-[#64748B] dark:text-[#94A3B8]">{desc}</p>
          {chips.length > 0 && (
            <div className="mt-3 flex w-full flex-col gap-1.5 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-left dark:border-[#334155] dark:bg-[#0F172A]">
              {chips.map((c, i) => (
                <div key={i} className={`text-[12px] leading-snug ${i === 0 ? "font-extrabold text-[#0F172A] dark:text-white" : "text-[#64748B] dark:text-[#94A3B8]"}`}>
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 p-4">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="min-h-[42px] flex-1 rounded-full border border-[#E2E8F0] bg-white px-4 text-[13px] font-bold text-[#475569] transition hover:bg-slate-50 active:scale-95 dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#CBD5E1] dark:hover:bg-white/5"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className={`min-h-[42px] flex-1 rounded-full px-4 text-[13px] font-extrabold text-white transition hover:brightness-110 active:scale-95 ${danger ? "bg-gradient-to-r from-rose-600 to-red-500 shadow-lg shadow-rose-500/30" : "bg-gradient-to-r from-amber-600 to-orange-500 shadow-lg shadow-amber-500/30"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
