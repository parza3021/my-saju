import { DAY_MASTER_CONTENT } from "@/lib/content/dayMaster";
import { SHI_SHEN_CONTENT } from "@/lib/content/shishen";
import { WUXING_CONTENT } from "@/lib/content/wuxing";
import { birthLabel, toDateInputValue, parseDateInput } from "@/lib/analysis";
import { Day } from "@/lib/engine/clock";
import { PersonFacts } from "@/lib/engine/natal";
import { elKo, SIGN_ELEMENT_PLAIN, SIGN_MODALITY_PLAIN, SIPSIN_LUCK } from "@/lib/engine/plain";
import { EL_ORDER } from "@/lib/engine/relations";
import { DayView, supplementWuxing, summarizeWeek } from "@/lib/iljin";
import { zodiacByName } from "@/lib/zodiac";
import EightCharGrid from "./saju/EightCharGrid";
import ElementBalance from "./saju/ElementBalance";
import Glossary from "./saju/Glossary";
import BasisFooter from "./saju/BasisFooter";
import IljinPanel from "./saju/IljinPanel";
import LuckTimeline from "./saju/LuckTimeline";
import NatalDetails from "./saju/NatalDetails";
import ShareButton from "./saju/ShareButton";
import { drawSajuCard } from "./saju/shareCard";
import { Card, Jargon, Section } from "./saju/ui";
import WeeklyFortune from "./WeeklyFortune";
import ZodiacCard from "./ZodiacCard";

export default function ResultSection({
  person,
  view,
  weekly,
  selectedDay,
  todayDay,
  onSelectedDayChange,
}: {
  person: PersonFacts;
  view: DayView;
  weekly: DayView[];
  selectedDay: Day;
  todayDay: Day;
  onSelectedDayChange: (day: Day) => void;
}) {
  const supplement = supplementWuxing(person);
  const dayMaster = DAY_MASTER_CONTENT[person.ilgan.cg];
  const weekSummary = summarizeWeek(weekly);
  const zodiac = zodiacByName(person.sun.sign);
  const shishenInPillars = Array.from(
    new Set(Object.values(person.stemSipsin).filter((s): s is NonNullable<typeof s> => !!s))
  );
  const dominant = EL_ORDER.reduce((a, b) => (person.ohaeng[b] > person.ohaeng[a] ? b : a));
  const missing = EL_ORDER.filter((w) => person.ohaeng[w] === 0);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <Section
        title="사주팔자 원국"
        right={<ShareButton fileName={`my-saju-${person.name}.png`} draw={(ctx) => drawSajuCard(ctx, person)} />}
      >
        <Card>
          <p className="text-sm text-white/55 mb-4">
            <b className="text-amber-300">{person.name}</b> · {birthLabel(person)}
          </p>
          <EightCharGrid person={person} />
          <p className="mt-4 text-xs text-white/40 leading-relaxed">
            음영 칸의 윗글자 <b className="text-white/70">{person.ilgan.cg}</b>이(가) 나 자신입니다 — 위쪽 줄은 윗글자(천간), 아래쪽 줄은 아랫글자(지지)이며 색은 오행입니다.
            칸 아래 글은 나에게 그 글자가 어떤 존재인지(십신)와 그 자리에서 나의 힘이 어느 단계인지(십이운성)입니다.
          </p>
          {!person.hasTime && (
            <p className="mt-2 text-xs text-white/40">태어난 시간이 입력되지 않아 시주는 표시되지 않았습니다.</p>
          )}
          {person.warnings.map((w) => (
            <p key={w} className="mt-2 text-xs text-amber-300/80">⚠ {w}</p>
          ))}
          {person.sun.cuspWarning && (
            <p className="mt-2 text-xs text-amber-300/80">⚠ 태양이 별자리 경계 근처라 출생 시각에 따라 별자리가 달라질 수 있습니다.</p>
          )}
        </Card>
      </Section>

      <Section
        title={view.isToday ? "오늘의 일진(日辰)" : "선택한 날의 일진(日辰)"}
        right={
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={toDateInputValue(selectedDay)}
              onChange={(e) => e.target.value && onSelectedDayChange(parseDateInput(e.target.value))}
              className="rounded-lg bg-white/10 border border-white/10 px-3 py-1.5 text-sm text-white outline-none focus:border-amber-400 [color-scheme:dark]"
            />
            {!view.isToday && (
              <button
                type="button"
                onClick={() => onSelectedDayChange(todayDay)}
                className="rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-sm text-white/70 transition-colors"
              >
                오늘로
              </button>
            )}
          </div>
        }
      >
        <IljinPanel view={view} person={person} supplement={supplement} />
      </Section>

      <Section
        title={`주간 운세 — ${weekly[0].facts.date.month}월 ${weekly[0].facts.date.day}일(${weekly[0].facts.date.weekday}) ~ ${weekly[6].facts.date.month}월 ${weekly[6].facts.date.day}일(${weekly[6].facts.date.weekday})`}
      >
        <WeeklyFortune days={weekly} summary={weekSummary} />
      </Section>

      <Section title="일간(日干) — 나를 상징하는 기운">
        <Card>
          <h3 className="text-xl font-semibold text-amber-300">{dayMaster.title}</h3>
          <p className="mt-2 text-sm text-white/70 leading-relaxed">{dayMaster.summary}</p>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-white/50 mb-1">강점</p>
              <ul className="text-sm text-white/80 space-y-1 list-disc list-inside">
                {dayMaster.strengths.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs text-white/50 mb-1">주의할 점</p>
              <ul className="text-sm text-white/80 space-y-1 list-disc list-inside">
                {dayMaster.cautions.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </Section>

      <Section title="오행(五行) 분포">
        <Card>
          <ElementBalance counts={person.ohaeng} />
          <div className="mt-4 space-y-2 text-sm text-white/70">
            <p>
              <span className="text-amber-300 font-medium">
                {dominant}({WUXING_CONTENT[dominant].hanja})
              </span>{" "}
              기운이 가장 강합니다. {WUXING_CONTENT[dominant].abundant}
            </p>
            {missing.length > 0 && (
              <p>
                <span className="text-white/50">{missing.map((w) => `${w}(${WUXING_CONTENT[w].hanja})`).join(", ")}</span> 기운은 사주 원국에 보이지 않습니다.{" "}
                {WUXING_CONTENT[missing[0]].lacking}
              </p>
            )}
          </div>
        </Card>
      </Section>

      {shishenInPillars.length > 0 && (
        <Section title="사주에 드러난 십신(十神)">
          <Card className="space-y-3">
            {shishenInPillars.map((s) => (
              <div key={s} className="text-sm">
                <span className="font-medium text-amber-300">{s}</span>
                <span className="text-white/70"> — {SHI_SHEN_CONTENT[s]}</span>
                <span className="block text-xs text-white/40">운에서는 &lsquo;{SIPSIN_LUCK[s]}&rsquo;이 늘어나는 기운입니다.</span>
              </div>
            ))}
          </Card>
        </Section>
      )}

      <Section title="타고난 구조 — 부딪힘·신살·복">
        <Card>
          <NatalDetails person={person} />
        </Card>
      </Section>

      <Section title="대운(大運)과 세운(歲運) — 시간에 따른 흐름">
        <Card>
          <LuckTimeline person={person} />
        </Card>
      </Section>

      <Section title="서양 별자리">
        <ZodiacCard zodiac={zodiac} />
        <p className="mt-3 text-xs text-white/45 leading-relaxed">
          태어난 순간 태양의 위치는 {person.sun.sign} {person.sun.degree}°(황경 {person.sun.longitude}°)입니다. 기질은 {SIGN_ELEMENT_PLAIN[person.sun.element]}
          <Jargon>{elKo(person.sun.element)}</Jargon>, 움직이는 방식은 {SIGN_MODALITY_PLAIN[person.sun.modality]}
          <Jargon>{person.sun.modality}</Jargon> 쪽입니다.
        </p>
      </Section>

      <Glossary />
      <BasisFooter />
    </div>
  );
}
