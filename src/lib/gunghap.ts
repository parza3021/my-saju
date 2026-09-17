import { getBranchRefs, findBranchRelations } from "./branchRelations";
import { describeDayMasterRelation } from "./content/dayMasterRelation";
import { describeZodiacCompat } from "./content/zodiacCompat";
import { calculateSaju } from "./saju";
import { BirthInput, GunghapResult } from "./types";
import { getZodiac } from "./zodiac";

export function analyzeGunghap(
  name1: string,
  input1: BirthInput,
  name2: string,
  input2: BirthInput
): GunghapResult {
  const saju1 = calculateSaju(input1);
  const saju2 = calculateSaju(input2);
  const zodiac1 = getZodiac(saju1.solarBirth.month, saju1.solarBirth.day);
  const zodiac2 = getZodiac(saju2.solarBirth.month, saju2.solarBirth.day);

  const dayMasterRelation = describeDayMasterRelation(
    saju1.dayMaster.wuxing,
    saju2.dayMaster.wuxing,
    name1,
    name2
  );

  const refs1 = getBranchRefs(saju1, 1);
  const refs2 = getBranchRefs(saju2, 2);
  const branchRelations = findBranchRelations(name1, refs1, name2, refs2);

  const zodiacCompat = describeZodiacCompat(zodiac1.element, zodiac2.element);

  return {
    person1: { name: name1, saju: saju1, zodiac: zodiac1 },
    person2: { name: name2, saju: saju2, zodiac: zodiac2 },
    dayMasterRelation,
    branchRelations,
    zodiacCompat,
  };
}
