"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "@/components/ui";

export interface NoticeMsg {
  tone: "ok" | "danger";
  text: string;
  /** 이 시간(초) 뒤에 스스로 사라진다. 안 주면 초록은 10초, 빨강은 사라지지 않는다 */
  hideSeconds?: number;
}

/** 초록색 완료 안내를 보여주는 시간(초) */
const OK_HIDE_SECONDS = 10;

/**
 * 화면 위쪽 안내 줄.
 * 초록색 완료 안내는 오른쪽에 남은 시간(10s → 1s)을 보여주다가 스스로 사라진다.
 * 빨간 오류 안내는 읽고 고칠 때까지 남겨 두되, hideSeconds 를 준 것(가벼운 입력 거절 등)은 그 시간 뒤 사라진다.
 */
export function Notice({ msg, onHide, className }: { msg: NoticeMsg | null; onHide: () => void; className?: string }) {
  const seconds = msg ? (msg.hideSeconds ?? (msg.tone === "ok" ? OK_HIDE_SECONDS : null)) : null;
  const [left, setLeft] = useState<number | null>(null);
  const hide = useRef(onHide);
  useEffect(() => {
    hide.current = onHide;
  });
  useEffect(() => {
    if (!msg || seconds === null) return;
    const end = Date.now() + seconds * 1000;
    const timer = setInterval(() => {
      const remain = Math.ceil((end - Date.now()) / 1000);
      if (remain <= 0) hide.current();
      else setLeft(remain);
    }, 200);
    return () => {
      clearInterval(timer);
      setLeft(null);
    };
  }, [msg, seconds]);

  if (!msg) return null;
  const ok = msg.tone === "ok";
  return (
    <p role="status" className={cx("flex items-center gap-3 rounded-[var(--radius-sm)] border px-3 py-2 text-xs", ok ? "border-ok/30 bg-ok-bg text-ok" : "border-danger/30 bg-danger-bg text-danger", className)}>
      <span className="min-w-0 flex-1">{msg.text}</span>
      {seconds !== null ? (
        <span
          className={cx("tnum shrink-0 rounded-full border bg-white/70 px-2 py-0.5 font-semibold", ok ? "border-ok/30" : "border-danger/30")}
          aria-hidden
          data-testid="notice-countdown"
          title="이 시간이 지나면 안내가 사라집니다"
        >
          {left ?? seconds}s
        </span>
      ) : null}
    </p>
  );
}
