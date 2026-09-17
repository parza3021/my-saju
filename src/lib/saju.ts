import { Lunar, Solar } from "lunar-javascript";
import { branchByHanja, shiShenToKr, stemByHanja, WUXING_LIST } from "./ganzhi";
import { BirthInput, Pillar, SajuResult, Wuxing } from "./types";

export function calculateSaju(input: BirthInput): SajuResult {
  const hour = input.hour ?? 12;
  const minute = input.hour === null ? 0 : input.minute;

  const lunar =
    input.calendarType === "solar"
      ? Solar.fromYmdHms(input.year, input.month, input.day, hour, minute, 0).getLunar()
      : Lunar.fromYmdHms(
          input.year,
          input.isLeapMonth ? -input.month : input.month,
          input.day,
          hour,
          minute,
          0
        );

  const ec = lunar.getEightChar();
  const solar = lunar.getSolar();

  const dayGan = stemByHanja(ec.getDayGan());

  const year: Pillar = {
    label: "년주",
    gan: stemByHanja(ec.getYearGan()),
    zhi: branchByHanja(ec.getYearZhi()),
    shiShen: shiShenToKr(ec.getYearShiShenGan()),
  };
  const month: Pillar = {
    label: "월주",
    gan: stemByHanja(ec.getMonthGan()),
    zhi: branchByHanja(ec.getMonthZhi()),
    shiShen: shiShenToKr(ec.getMonthShiShenGan()),
  };
  const day: Pillar = {
    label: "일주",
    gan: dayGan,
    zhi: branchByHanja(ec.getDayZhi()),
    shiShen: null,
  };
  const time: Pillar | null =
    input.hour === null
      ? null
      : {
          label: "시주",
          gan: stemByHanja(ec.getTimeGan()),
          zhi: branchByHanja(ec.getTimeZhi()),
          shiShen: shiShenToKr(ec.getTimeShiShenGan()),
        };

  const wuxingCount: Record<Wuxing, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  const pillars = [year, month, day, ...(time ? [time] : [])];
  for (const p of pillars) {
    wuxingCount[p.gan.wuxing]++;
    wuxingCount[p.zhi.wuxing]++;
  }
  // ensure stable key order for iteration elsewhere
  const orderedWuxingCount = Object.fromEntries(
    WUXING_LIST.map((w) => [w, wuxingCount[w]])
  ) as Record<Wuxing, number>;

  return {
    solarBirth: {
      year: solar.getYear(),
      month: solar.getMonth(),
      day: solar.getDay(),
      hour: input.hour ?? 12,
      minute: input.hour === null ? 0 : input.minute,
    },
    timeKnown: input.hour !== null,
    year,
    month,
    day,
    time,
    dayMaster: dayGan,
    wuxingCount: orderedWuxingCount,
  };
}

export function getPillars(saju: SajuResult): Pillar[] {
  return [saju.year, saju.month, saju.day, saju.time].filter((p): p is Pillar => p !== null);
}
