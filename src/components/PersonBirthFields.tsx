"use client";

import { BirthInput } from "@/lib/types";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export interface PersonFormState {
  name: string;
  calendarType: "solar" | "lunar";
  year: string;
  month: string;
  day: string;
  isLeapMonth: boolean;
  timeUnknown: boolean;
  hour: string;
  minute: string;
}

export const DEFAULT_PERSON: PersonFormState = {
  name: "",
  calendarType: "solar",
  year: "1995",
  month: "1",
  day: "1",
  isLeapMonth: false,
  timeUnknown: false,
  hour: "12",
  minute: "0",
};

export function personFormToBirthInput(state: PersonFormState): BirthInput | null {
  const y = Number(state.year);
  const m = Number(state.month);
  const d = Number(state.day);

  if (!y || !m || !d || m < 1 || m > 12 || d < 1 || d > 31) return null;

  return {
    calendarType: state.calendarType,
    year: y,
    month: m,
    day: d,
    isLeapMonth: state.calendarType === "lunar" ? state.isLeapMonth : false,
    hour: state.timeUnknown ? null : Number(state.hour),
    minute: state.timeUnknown ? 0 : Number(state.minute),
  };
}

interface Props {
  title?: string;
  namePlaceholder?: string;
  value: PersonFormState;
  onChange: (next: PersonFormState) => void;
  children?: React.ReactNode;
}

export default function PersonBirthFields({ title, namePlaceholder, value, onChange, children }: Props) {
  const set = <K extends keyof PersonFormState>(key: K, val: PersonFormState[K]) =>
    onChange({ ...value, [key]: val });

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6 sm:p-8 space-y-6">
      {title && <h3 className="text-lg font-semibold text-amber-300">{title}</h3>}

      {namePlaceholder && (
        <label className="block text-sm text-white/70">
          이름 (선택)
          <input
            type="text"
            value={value.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder={namePlaceholder}
            className="mt-1 w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white outline-none focus:border-amber-400"
          />
        </label>
      )}

      <div>
        <span className="block text-sm font-medium text-white/70 mb-2">양력 / 음력</span>
        <div className="flex gap-2">
          {(["solar", "lunar"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => set("calendarType", type)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                value.calendarType === type
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
            value={value.year}
            onChange={(e) => set("year", e.target.value)}
            className="mt-1 w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white outline-none focus:border-amber-400"
            placeholder="1995"
          />
        </label>
        <label className="text-sm text-white/70">
          월
          <input
            type="number"
            value={value.month}
            onChange={(e) => set("month", e.target.value)}
            className="mt-1 w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white outline-none focus:border-amber-400"
            placeholder="1"
          />
        </label>
        <label className="text-sm text-white/70">
          일
          <input
            type="number"
            value={value.day}
            onChange={(e) => set("day", e.target.value)}
            className="mt-1 w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white outline-none focus:border-amber-400"
            placeholder="1"
          />
        </label>
      </div>

      {value.calendarType === "lunar" && (
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            checked={value.isLeapMonth}
            onChange={(e) => set("isLeapMonth", e.target.checked)}
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
              checked={value.timeUnknown}
              onChange={(e) => set("timeUnknown", e.target.checked)}
              className="rounded border-white/20"
            />
            시간을 모릅니다
          </label>
        </div>
        {!value.timeUnknown && (
          <div className="grid grid-cols-2 gap-3">
            <select
              value={value.hour}
              onChange={(e) => set("hour", e.target.value)}
              className="rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white outline-none focus:border-amber-400"
            >
              {HOURS.map((h) => (
                <option key={h} value={h} className="bg-neutral-900">
                  {String(h).padStart(2, "0")}시
                </option>
              ))}
            </select>
            <select
              value={value.minute}
              onChange={(e) => set("minute", e.target.value)}
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

      {children}
    </div>
  );
}
