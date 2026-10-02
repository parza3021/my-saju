#!/usr/bin/env python3
"""
saju-iljin-doc 스킬의 Python 엔진을 정답(골든)으로 삼아, TS 이식본을 대조할 픽스처를 만든다.

사용:  python3 scripts/gen-fixtures.py <스킬 폴더(saju-iljin-doc)>
출력:  src/lib/engine/__fixtures__/*.json

- 시각은 모두 'UTC 기준 epoch 밀리초'로 저장한다(TS의 Ms 와 같은 표현).
- 임의 케이스는 시드를 고정해 항상 같은 파일이 나온다.
- 실제 사람의 생년월일은 쓰지 않는다(경계 케이스는 날짜만, 임의 케이스는 난수).
"""
import datetime as dt
import json
import os
import random
import sys

SK = sys.argv[1]
sys.path.insert(0, os.path.join(SK, "scripts"))
import manseryeok as M  # noqa: E402

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src", "lib", "engine", "__fixtures__")
os.makedirs(OUT, exist_ok=True)
EPOCH = dt.datetime(1970, 1, 1)
EPOCH_D = dt.date(1970, 1, 1)


def ms(t):
    return round((t - EPOCH).total_seconds() * 1000, 3)


def day_no(d):
    return (d - EPOCH_D).days


def D(x):
    return dt.datetime.fromisoformat(x)


# ------------------------------------------------------------------ 원국 케이스
cases = []


def add(birth, **kw):
    cases.append({"birth": birth.isoformat(sep=" ")[:16], "kw": kw})


# 1) 스킬 테스트의 경계 케이스
for d0 in ("2026-09-03", "2000-01-01", "2024-02-10"):
    base = dt.date.fromisoformat(d0)
    for t in (dt.datetime.combine(base, dt.time(23, 10)), dt.datetime.combine(base, dt.time(23, 40)),
              dt.datetime.combine(base + dt.timedelta(days=1), dt.time(0, 20)),
              dt.datetime.combine(base + dt.timedelta(days=1), dt.time(1, 40))):
        add(t)
        add(t, jasi_mode="split")
        add(t, lon_correction=False)
for t in ("1987-07-15 10:30", "1988-08-20 14:10", "1988-05-08 03:40", "1956-03-10 13:05", "1958-11-02 07:10",
          "1960-01-20 23:15", "1955-07-01 12:00", "1948-07-10 12:00", "1950-06-15 12:00", "1951-06-15 12:00",
          "1959-06-15 12:00", "1961-08-09 23:30", "1961-08-10 00:10", "1954-03-20 23:50", "1954-03-21 00:10",
          "2024-03-15 12:00", "2023-06-20 09:00", "2000-11-01 06:00", "2024-02-04 16:26", "2024-02-04 16:27"):
    add(D(t))
# 2) 모든 절 앞뒤 ±3분 (여러 해)
for y in (1960, 1985, 1999, 2007, 2016, 2024, 2031):
    for k in range(12):
        target = (315 + 30 * k) % 360
        inst = M.solar_term_utc(target, dt.datetime(y, 2, 4) + dt.timedelta(days=30.4 * k))
        kst = inst + M.KST
        for off in (-3, 3):
            t = (kst + dt.timedelta(minutes=off)).replace(second=0, microsecond=0)
            add(t)
# 3) 임의 양력
rnd = random.Random(20261002)
for _ in range(260):
    y = rnd.randint(1930, 2049)
    t = dt.datetime(y, rnd.randint(1, 12), rnd.randint(1, 28), rnd.randint(0, 23), rnd.randint(0, 59))
    kw = {}
    if rnd.random() < 0.2:
        kw["longitude"] = rnd.choice([126.5, 128.9, 129.0, 126.9])
    if rnd.random() < 0.1:
        kw["lon_correction"] = False
    if rnd.random() < 0.15:
        kw["jasi_mode"] = "split"
    add(t, **kw)
# 4) 음력(윤달 포함)
for _ in range(80):
    y = rnd.randint(1950, 2030)
    months = M.lunar_months(y)
    m, lp, start, n = rnd.choice(months)
    add(dt.datetime(y, m, rnd.randint(1, min(n, 28)), rnd.randint(0, 23), rnd.randint(0, 59)), calendar="lunar", leap=lp)
for y, m in ((2023, 2), (2020, 4), (2025, 6)):
    add(dt.datetime(y, m, 1, 12), calendar="lunar", leap=True)

out = []
for c in cases:
    kw = dict(c["kw"])
    t = D(c["birth"])
    r = M.saju(t, **kw)
    item = {
        "birth": c["birth"], "opts": {
            "calendar": kw.get("calendar", "solar"), "leap": kw.get("leap", False),
            "longitude": kw.get("longitude", 127.0), "lonCorrection": kw.get("lon_correction", True),
            "jasiMode": kw.get("jasi_mode", "unified")},
        "year": list(r["year"]), "month": list(r["month"]), "day": list(r["day"]), "hour": list(r["hour"]),
        "solarDate": day_no(r["solar_date"]), "utcMs": ms(r["utc"]), "utcOffsetMin": r["utc_offset"].total_seconds() / 60,
        "dst": r["dst"], "ipchunKstMs": ms(r["ipchun_kst"]), "jie": [r["jie"][0], ms(r["jie"][1])],
    }
    dw = {}
    for g in ("M", "F"):
        fwd, su, exact, seq = M.daewoon(r, g)
        dw[g] = {"forward": fwd, "startAge": su, "exactAge": exact, "seq": [list(s) for s in seq]}
    item["daewoon"] = dw
    out.append(item)
json.dump(out, open(os.path.join(OUT, "saju.json"), "w"), ensure_ascii=False)
print("saju.json", len(out), "건")

# ------------------------------------------------------------------ 음력→양력 (천문연 대조 구간 샘플)
lun = []
for y in list(range(1954, 1962)) + list(range(1980, 2031, 1)):
    for m, lp, start, n in M.lunar_months(y):
        for d in (1, n // 2, n):
            lun.append({"y": y, "m": m, "d": d, "leap": lp, "solar": day_no(M.lunar_to_solar(y, m, d, lp))})
json.dump(lun, open(os.path.join(OUT, "lunar.json"), "w"))
print("lunar.json", len(lun), "건")

# ------------------------------------------------------------------ 태양 황경 / 달력 유틸
sun = []
for _ in range(120):
    t = dt.datetime(rnd.randint(1920, 2060), rnd.randint(1, 12), rnd.randint(1, 28), rnd.randint(0, 23), rnd.randint(0, 59))
    sun.append({"utcMs": ms(t), "lon": M.solar_longitude_utc(t)})
gzs = []
for _ in range(60):
    d = dt.date(rnd.randint(1900, 2100), rnd.randint(1, 12), rnd.randint(1, 28))
    gzs.append({"day": day_no(d), "idx": M.day_ganzhi_index(d)})
json.dump({"sun": sun, "dayGanzhi": gzs}, open(os.path.join(OUT, "sun.json"), "w"))
print("sun.json", len(sun), len(gzs), "건")

# ------------------------------------------------------------------ 그룹(관계·별점) — compute_group.py 출력 그대로
import subprocess  # noqa: E402
import tempfile  # noqa: E402

REPORT_DATE = "2026-10-02"


def run_group(cfg):
    with tempfile.TemporaryDirectory() as tmp:
        mp, fp = os.path.join(tmp, "members.json"), os.path.join(tmp, "facts.json")
        json.dump(cfg, open(mp, "w", encoding="utf-8"), ensure_ascii=False)
        subprocess.run([sys.executable, os.path.join(SK, "scripts", "group", "compute_group.py"), mp,
                        "--date", REPORT_DATE, "--out", fp], check=True, stdout=subprocess.DEVNULL)
        return json.load(open(fp, encoding="utf-8"))


def rand_member(r, name):
    y = r.randint(1950, 2012)
    m = {"name": name, "date": f"{y}-{r.randint(1, 12):02d}-{r.randint(1, 28):02d}"}
    if r.random() < 0.85:
        m["time"] = f"{r.randint(0, 23):02d}:{r.randint(0, 59):02d}"
    else:
        m["time"] = None
    if r.random() < 0.8:
        m["gender"] = r.choice(["M", "F"])
    if r.random() < 0.15:
        m["calendar"] = "lunar"
        ms_ = M.lunar_months(y)
        mm, lp, _s, n = r.choice(ms_)
        m["date"] = f"{y}-{mm:02d}-{r.randint(1, min(n, 28)):02d}"
        m["leap"] = lp
    return m


groups = []
sample = json.load(open(os.path.join(SK, "reference", "group", "sample", "members.json"), encoding="utf-8"))
groups.append(sample)
r2 = random.Random(7)
names = ["가", "나", "다", "라", "마", "바"]
for n in [2] * 28 + [3] * 8 + [4] * 4 + [5, 6]:
    groups.append({"group": "임의", "members": [rand_member(r2, names[i]) for i in range(n)]})
gout = [{"cfg": cfg, "facts": run_group(cfg)} for cfg in groups]
json.dump({"reportDate": REPORT_DATE, "groups": gout}, open(os.path.join(OUT, "group.json"), "w"), ensure_ascii=False)
print("group.json", len(gout), "건")

# ------------------------------------------------------------------ 일진(compute_iljin.py) — 가상 인물 1명 기준
# 스킬의 일일 계산기는 팀 4명이 모듈 상수로 박혀 있다. 팀원의 실제 생년월일을 쓰지 않도록,
# 난수로 만든 가상 인물의 원국을 그 상수 자리에 끼워 넣어 함수들을 호출한다.
sys.path.insert(0, os.path.join(SK, "scripts", "daily"))
import compute_iljin as CI  # noqa: E402
import relations as R  # noqa: E402

POSK = ["년", "월", "일", "시"]
rd = random.Random(31)
daily = []
person_births = []
for i in range(6):
    person_births.append(dt.datetime(rd.randint(1960, 2005), rd.randint(1, 12), rd.randint(1, 28), rd.randint(0, 23), rd.randint(0, 59)))
target_days = [dt.date(2026, 10, 2), dt.date(2026, 2, 4), dt.date(2026, 8, 7), dt.date(2026, 10, 8), dt.date(2026, 12, 31), dt.date(2027, 1, 1)]
for _ in range(10):
    target_days.append(dt.date(rd.randint(2022, 2030), rd.randint(1, 12), rd.randint(1, 28)))

for birth in person_births:
    r = M.saju(birth)
    cgs = {p: M.CHEONGAN[r[k][0]] for p, k in zip(POSK, ["year", "month", "day", "hour"])}
    jjs = {p: M.JIJI[r[k][1]] for p, k in zip(POSK, ["year", "month", "day", "hour"])}
    sun_lon = round(M.solar_longitude_utc(r["utc"]), 2)
    CI.PEOPLE = ["X"]
    CI.NATAL_CHEONGAN = {"X": cgs}
    CI.NATAL_JIJI = {"X": jjs}
    CI.PEOPLE_ILGAN = {"X": cgs["일"]}
    CI.NATAL_SUN_LONGITUDE = {"X": sun_lon}
    X = {"name": "X", "ilgan": {"cg": cgs["일"]},
         "pillars": {k: {"cg": cgs[p], "jj": jjs[p], "hanja": ""} for p, k in zip(POSK, ["year", "month", "day", "hour"])}}
    for d in target_days:
        g = CI.ganzhi_for_date(d)
        ym = CI.year_month_pillars(d)
        tname, tinst = CI.next_term(d)
        owners = CI.team_owners({f"세운({ym['year']})": ym["year"][1], f"월운({ym['month']})": ym["month"][1]})
        oh_rows, oh_total = CI.ohaeng_report(d)
        Y = {"name": "오늘", "ilgan": {"cg": g["cheongan"]}, "pillars": {"day": {"cg": g["cheongan"], "jj": g["jiji"], "hanja": ""}}}
        sc = R.score(X, Y, R.pair_facts(X, Y), R.guiin_of(X, Y))
        sk = CI.sky(d)
        daily.append({
            "birth": birth.isoformat(sep=" ")[:16], "date": d.isoformat(),
            "ganzhi": {"n": g["n"], "ganjiKr": g["ganji_kr"]},
            "yearMonth": {"year": ym["year"], "month": ym["month"], "jieName": ym["jie_name"], "jieKstMs": ms(ym["jie_kst"])},
            "nextTerm": [tname, ms(tinst)],
            "sinsal": CI.sinsal_for_people(g["jiji"])["X"], "gilsin": CI.gilsin_for_people(g["jiji"])["X"],
            "reactions": CI.reactions(g["cheongan"], g["jiji"])["X"],
            "structures": R.structures_with(g["jiji"], owners),
            "ohaeng": {"rows": oh_rows, "total": oh_total},
            "hours": CI.hour_table(d),
            "sky": {"sun": sk["sun"], "moon": sk["moon"], "sunAspect": sk["sun_aspects"]["X"],
                    "moonEvents": sk["moon_events"]["X"], "sunEvents": sk["sun_events"]["X"],
                    "moon00": sk["moon_00"], "moon24": sk["moon_24"], "sun00": sk["sun_00"], "sun24": sk["sun_24"],
                    "moonIngress": list(sk["moon_ingress"]) if sk["moon_ingress"] else None,
                    "elong00": sk["elong_00"], "elong24": sk["elong_24"]},
            "unseong": R.unseong(cgs["일"], g["jiji"]),
            "sipsinToday": [R.sipsin(M.CHEONGAN.index(cgs["일"]), M.CHEONGAN.index(g["cheongan"])),
                            R.sipsin(M.CHEONGAN.index(cgs["일"]), M.CHEONGAN.index(CI._jj_main_stem(g["jiji"])))],
            "dayScore": {"sipsin": sc["sipsin"], "raw": sc["raw"], "stars": sc["stars"], "why": sc["why"]},
        })
json.dump(daily, open(os.path.join(OUT, "daily.json"), "w", encoding="utf-8"), ensure_ascii=False)
print("daily.json", len(daily), "건")
