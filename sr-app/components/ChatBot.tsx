"use client";
import { useEffect, useRef, useState } from "react";
import { CHAT_SUGGESTIONS, answerChatbot, type ChatCtx } from "@/lib/chatbot";

type Msg = { role: "user" | "bot"; text: string };

export default function ChatBot({ ctx }: { ctx: ChatCtx }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>(() => [
    { role: "bot", text: "Halo! Saya Tanya Data — tanya apa saja tentang Dapil 1 (34 kelurahan, target, rekap, blank spot). Coba pilih suggestion di bawah atau ketik pertanyaan." },
  ]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 120); }, [open]);

  function send(text: string) {
    const q = text.trim();
    if (!q) return;
    const ans = answerChatbot(q, ctx);
    setMsgs((m) => [...m, { role: "user", text: q }, { role: "bot", text: ans }]);
    setInput("");
  }

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Tutup chat" : "Buka Tanya Data"}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60] w-14 h-14 rounded-full bg-[#2563EB] text-white shadow-[0_8px_24px_rgba(37,99,235,0.4)] border border-white/20 flex items-center justify-center text-[22px] hover:bg-[#1D4ED8] transition"
      >
        {open ? "✕" : "💬"}
        {!open && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-[88px] sm:right-6 z-[60] sm:w-[380px] w-full sm:h-[520px] h-[100dvh] sm:rounded-2xl rounded-none bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-[0_20px_60px_rgba(15,23,42,0.18)] flex flex-col overflow-hidden">
          <div className="h-14 shrink-0 bg-gradient-to-r from-[#2563EB] to-[#0EA5E9] text-white flex items-center gap-3 px-4">
            <span className="w-8 h-8 rounded-full bg-white/20 grid place-items-center text-[16px]">🤖</span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-extrabold leading-none">Tanya Data — Dapil 1</div>
              <div className="text-[11px] opacity-90 leading-none mt-0.5">Jawab dari data dashboard (live) · 34 kelurahan</div>
            </div>
            <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-white/15 grid place-items-center text-[14px] hover:bg-white/25">✕</button>
          </div>

          <div ref={listRef} className="flex-1 overflow-auto p-3 space-y-3 bg-[#F8FAFC] dark:bg-[#020617]">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-[1.5] whitespace-pre-wrap border shadow-sm ${m.role === "user" ? "bg-[#2563EB] text-white border-[#2563EB] rounded-br-md" : "bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#E2E8F0] border-[#E2E8F0] dark:border-[#334155] rounded-bl-md"}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="shrink-0 border-t border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] p-2 space-y-2">
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {CHAT_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="shrink-0 bg-[#EFF6FF] dark:bg-[#1E293B] border border-[#DBEAFE] dark:border-[#334155] text-[#2563EB] dark:text-[#93C5FD] rounded-full px-3 py-1.5 text-[11px] font-semibold hover:bg-[#DBEAFE] dark:hover:bg-[#334155] whitespace-nowrap"
                >
                  {s}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="flex items-center gap-2 bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-full px-2 py-1.5"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanya: progress target? blank spot di mana? Kemijen berapa relawan?"
                className="flex-1 bg-transparent outline-none text-[12px] placeholder:text-[#94A3AF] px-2 min-w-0"
              />
              <button type="submit" disabled={!input.trim()} className="w-8 h-8 shrink-0 rounded-full bg-[#2563EB] text-white grid place-items-center text-[14px] disabled:opacity-40 hover:bg-[#1D4ED8]">➤</button>
            </form>
            <div className="flex items-center justify-between text-[10px] text-[#94A3AF] px-1">
              <span>Enter untuk kirim · data live dari dashboard</span>
              <button onClick={() => setMsgs([{ role: "bot", text: "Riwayat dibersihkan. Tanya lagi?" }])} className="font-semibold text-[#64748B] hover:text-[#334155]">Bersihkan</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
