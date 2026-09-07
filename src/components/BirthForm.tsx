"use client";

import { useState } from "react";
import { BirthInput } from "@/lib/types";

interface Props {
  onSubmit: (input: BirthInput) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function BirthForm({ onSubmit }: Props) {
  const [calendarType, setCalendarType] = useState<"solar" | "lunar">("solar");
  const [year, setYear] = useState("1995");
  const [month, setMonth] = useState("1");
  const [day, setDay] = useState("1");
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("0");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const y = Number(year);
    const m = Number(month);
    const d = Number(day);

    if (!y || !m || !d || m < 1 || m > 12 || d < 1 || d > 31) {
      setError("생년월일을 올바르게 입력해주세요.");
      return;
    }
    setError(null);

    onSubmit({
      calendarType,
      year: y,
      month: m,
      day: d,
      isLeapMonth: calendarType === "lunar" ? isLeapMonth : false,
      hour: timeUnknown ? null : Number(hour),
      minute: timeUnknown ? 0 : Number(minute),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6"
    >
      <div>
        <span className="block text-sm font-medium text-white/70 mb-2">양력 / 음력</span>
        <div className="flex gap-2">
          {(["solar", "lunar"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setCalendarType(type)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                calendarType === type
                  ? "bg-amber-400 text-neutral-900"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              {type === "solar" ? "양력" : "음력"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <label className="text-sm text-white/70">
          년
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="mt-1 w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white outline-none focus:border-amber-400"
            placeholder="1995"
          />
        </label>
        <label className="text-sm text-white/70">
          월
          <input
            type="number"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="mt-1 w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white outline-none focus:border-amber-400"
            placeholder="1"
          />
        </label>
        <label className="text-sm text-white/70">
          일
          <input
            type="number"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="mt-1 w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white outline-none focus:border-amber-400"
            placeholder="1"
          />
        </label>
      </div>

      {calendarType === "lunar" && (
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            checked={isLeapMonth}
            onChange={(e) => setIsLeapMonth(e.target.checked)}
            className="rounded border-white/20"
          />
          윤달입니다
        </label>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="block text-sm font-medium text-white/70">태어난 시간</span>
          <label className="flex items-center gap-2 text-xs text-white/50">
            <input
              type="checkbox"
              checked={timeUnknown}
              onChange={(e) => setTimeUnknown(e.target.checked)}
              className="rounded border-white/20"
            />
            시간을 모릅니다
          </label>
        </div>
        {!timeUnknown && (
          <div className="grid grid-cols-2 gap-3">
            <select
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              className="rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white outline-none focus:border-amber-400"
            >
              {HOURS.map((h) => (
                <option key={h} value={h} className="bg-neutral-900">
                  {String(h).padStart(2, "0")}시
                </option>
              ))}
            </select>
            <select
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              className="rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white outline-none focus:border-amber-400"
            >
              {[0, 10, 20, 30, 40, 50].map((m) => (
                <option key={m} value={m} className="bg-neutral-900">
                  {String(m).padStart(2, "0")}분
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        className="w-full rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-900 font-semibold py-3 transition-colors"
      >
        사주 풀이 보기
      </button>
    </form>
  );
}
