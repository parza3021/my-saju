#!/usr/bin/env python3
"""saju-iljin-doc 스킬의 manseryeok.py 에서 VSOP87 계수표를 꺼내 src/lib/engine/vsop87.ts 를 만든다.
사용: python3 scripts/gen-vsop87.py <스킬 폴더>   (스킬 폴더 = saju-iljin-doc)"""
import sys

sys.path.insert(0, sys.argv[1] + "/scripts")
import manseryeok as m  # noqa: E402

out = ["// 자동 생성: saju-iljin-doc/scripts/manseryeok.py 의 VSOP87 절단급수 (Meeus, Astronomical Algorithms 부록 III)",
       "// 손으로 고치지 말 것 — scripts/gen-vsop87.py 로 다시 만든다.",
       "export type Term = readonly [number, number, number];", ""]
for n in range(6):
    arr = getattr(m, f"_L{n}")
    body = ",\n  ".join("[" + ", ".join(repr(x) for x in t) + "]" for t in arr)
    out.append(f"export const L{n}: readonly Term[] = [\n  {body},\n];\n")
open("src/lib/engine/vsop87.ts", "w").write("\n".join(out))
