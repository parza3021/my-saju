import { PersonFormState } from "@/components/PersonBirthFields";
import { BirthInput } from "./types";

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
