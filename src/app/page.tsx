"use client";

import { useMemo, useRef, useState } from "react";
import BirthForm from "@/components/BirthForm";
import ResultSection from "@/components/ResultSection";
import SiteNav from "@/components/SiteNav";
import {
  calculateDailyFortune,
  calculateWeeklyFortune,
  parseDateInput,
  summarizeWeek,
  toDateInputValue,
} from "@/lib/iljin";
import { calculateSaju } from "@/lib/saju";
import { BirthInput, SajuResult, ZodiacResult } from "@/lib/types";
import { getZodiac } from "@/lib/zodiac";

export default function Home() {
  const [saju, setSaju] = useState<SajuResult | null>(null);
  const [zodiac, setZodiac] = useState<ZodiacResult | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => toDateInputValue(new Date()));
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const fortune = useMemo(() => {
    if (!saju) return null;
    const date = parseDateInput(selectedDate);
    const weekly = calculateWeeklyFortune(saju, date);
    return {
      iljin: calculateDailyFortune(saju, date),
      weekly,
      weekSummary: summarizeWeek(weekly),
    };
  }, [saju, selectedDate]);

  function handleSubmit(input: BirthInput) {
    try {
      const result = calculateSaju(input);
      const z = getZodiac(result.solarBirth.month, result.solarBirth.day);
      setSaju(result);
      setZodiac(z);
      setError(null);
      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch {
      setError("입력하신 생년월일을 계산할 수 없습니다. 날짜를 다시 확인해주세요.");
      setSaju(null);
      setZodiac(null);
    }
  }

  return (
    <main className="flex-1 px-4 py-16 sm:py-24">
      <SiteNav active="saju" />
      <div className="max-w-3xl mx-auto text-center mb-12">
        <p className="text-amber-400 text-sm font-medium tracking-wide mb-3">
          정통 명리학 × 서양 점성술
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          내 사주팔자와 별자리, 지금 바로 확인하세요
        </h1>
        <p className="text-white/60 leading-relaxed">
          생년월일시를 입력하면 사주팔자 원국과 오행 분포, 일간 성격 풀이는 물론
          서양 별자리 정보까지 로그인 없이 바로 확인할 수 있습니다.
        </p>
      </div>

      <BirthForm onSubmit={handleSubmit} />

      {error && (
        <p className="mt-6 text-center text-sm text-red-400">{error}</p>
      )}

      {saju && zodiac && fortune && (
        <div ref={resultRef} className="pt-16">
          <ResultSection
            saju={saju}
            zodiac={zodiac}
            iljin={fortune.iljin}
            weekly={fortune.weekly}
            weekSummary={fortune.weekSummary}
            selectedDate={selectedDate}
            onSelectedDateChange={setSelectedDate}
            onResetDate={() => setSelectedDate(toDateInputValue(new Date()))}
          />
        </div>
      )}

      <footer className="mt-24 text-center text-xs text-white/30">
        본 서비스의 풀이는 전통 명리학 및 서양 점성술 이론을 바탕으로 한 참고용 콘텐츠이며,
        의학적·법적·재정적 조언을 대체하지 않습니다.
      </footer>
    </main>
  );
}
