// 공유용 결과 카드(1080×1350, 인스타 세로 비율)를 캔버스에 그린다. 버튼을 누를 때 브라우저에서만 실행된다.
import { birthLabel } from "@/lib/analysis";
import type { MatrixCell } from "@/lib/engine/group";
import type { PersonFacts } from "@/lib/engine/natal";
import { ILGAN_IMAGE, OHAENG, POS_LONG, SIGN_ELEMENT_PLAIN, SIPSIN_PERSON, STARS } from "@/lib/engine/plain";
import { EL_ORDER, josa, PILLAR_KO, PillarKey, Wuxing } from "@/lib/engine/relations";
import type { GunghapResult } from "@/lib/gunghap";
import { branchElOf, branchHanja, EL_VAR, stemElOf, stemHanja } from "./colors";

export const CARD_W = 1080;
export const CARD_H = 1350;

type Ctx = CanvasRenderingContext2D;

const FONT = '"Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", sans-serif';
const AMBER = "#fcd34d";
const DIM = "rgba(255,255,255,0.5)";
const COLS: PillarKey[] = ["hour", "day", "month", "year"];

// 화면과 같은 오행 색을 쓰도록 globals.css 의 CSS 변수를 읽는다
const elColor = (el: Wuxing) => getComputedStyle(document.documentElement).getPropertyValue(EL_VAR[el].slice(4, -1)).trim();

function text(ctx: Ctx, s: string, x: number, y: number, size: number, color: string, weight = 400, align: CanvasTextAlign = "center") {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(s, x, y);
}

function frame(ctx: Ctx, title: string, sub: string) {
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, CARD_W, CARD_H);
  text(ctx, "정통 명리학 × 서양 점성술", CARD_W / 2, 110, 30, AMBER, 600);
  text(ctx, title, CARD_W / 2, 195, 64, "#ffffff", 700);
  text(ctx, sub, CARD_W / 2, 255, 30, DIM);
  text(ctx, "my-saju · 재미로 보는 전통 해석입니다", CARD_W / 2, CARD_H - 50, 26, "rgba(255,255,255,0.3)");
}

/** 가운데 정렬로 채운 별 n개 + 빈 별 */
function stars(ctx: Ctx, n: number, cx: number, y: number, size: number) {
  ctx.font = `${size}px ${FONT}`;
  const full = "★".repeat(n);
  const empty = "★".repeat(5 - n);
  const x = cx - ctx.measureText(full + empty).width / 2;
  text(ctx, full, x, y, size, AMBER, 400, "left");
  text(ctx, empty, x + ctx.measureText(full).width, y, size, "rgba(255,255,255,0.2)", 400, "left");
}

function glyphBox(ctx: Ctx, hanja: string, hangul: string, el: Wuxing, x: number, y: number, w: number, h: number) {
  const c = elColor(el);
  ctx.fillStyle = `color-mix(in srgb, ${c} 16%, transparent)`;
  ctx.strokeStyle = `color-mix(in srgb, ${c} 40%, transparent)`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 18);
  ctx.fill();
  ctx.stroke();
  text(ctx, hanja, x + w / 2, y + h / 2 + 22, 92, c, 700);
  text(ctx, hangul, x + w / 2, y + h - 22, 28, c);
}

export function drawSajuCard(ctx: Ctx, P: PersonFacts) {
  frame(ctx, `${P.name}의 사주팔자`, birthLabel(P));

  const colW = 200;
  const left = (CARD_W - colW * 4 - 30 * 3) / 2;
  COLS.forEach((k, i) => {
    const x = left + i * (colW + 30);
    const p = P.pillars[k];
    text(ctx, k === "day" ? "태어난 날 · 나" : POS_LONG[PILLAR_KO[k]][0], x + colW / 2, 340, 28, k === "day" ? AMBER : DIM);
    if (!p) {
      text(ctx, "?", x + colW / 2, 560, 92, "rgba(255,255,255,0.25)");
      text(ctx, "시각 모름", x + colW / 2, 640, 28, "rgba(255,255,255,0.25)");
      return;
    }
    glyphBox(ctx, stemHanja(p.cg), p.cg, stemElOf(p.cg), x, 370, colW, 190);
    glyphBox(ctx, branchHanja(p.jj), p.jj, branchElOf(p.jj), x, 575, colW, 190);
  });

  const el = P.ilgan.element;
  text(ctx, `${ILGAN_IMAGE[P.ilgan.cg]}에 비유되는 ${el}(${OHAENG[el]}) 기운이 '나'`, CARD_W / 2, 860, 38, "#ffffff", 600);

  const max = Math.max(1, ...EL_ORDER.map((e) => P.ohaeng[e]));
  EL_ORDER.forEach((e, i) => {
    const y = 930 + i * 52;
    text(ctx, `${e} ${OHAENG[e]}`, 150, y + 26, 28, elColor(e), 600, "left");
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.beginPath();
    ctx.roundRect(400, y + 6, 480, 24, 12);
    ctx.fill();
    ctx.fillStyle = elColor(e);
    ctx.beginPath();
    ctx.roundRect(400, y + 6, Math.max(24, (480 * P.ohaeng[e]) / max), 24, 12);
    if (P.ohaeng[e]) ctx.fill();
    text(ctx, String(P.ohaeng[e]), 920, y + 28, 30, "#ffffff", 600, "right");
  });

  text(ctx, `${P.sun.sign} · ${SIGN_ELEMENT_PLAIN[P.sun.element]}`, CARD_W / 2, 1240, 34, DIM);
}

export function drawGunghapCard(ctx: Ctx, r: GunghapResult) {
  const { a, b, ab, ba, pair, kind } = r;
  frame(ctx, `${a.name} × ${b.name}`, `${kind} 궁합`);

  stars(ctx, Math.round(pair.sajuStars.avg), CARD_W / 2, 420, 110);
  text(ctx, `두 방향 평균 ★${pair.sajuStars.avg} · ${STARS[Math.round(pair.sajuStars.avg)]}`, CARD_W / 2, 500, 34, DIM);

  const direction = (from: PersonFacts, to: PersonFacts, cell: MatrixCell, y: number) => {
    text(ctx, `${josa(from.name, "이", "가")} ${josa(to.name, "을", "를")} 볼 때`, CARD_W / 2, y, 30, DIM);
    text(ctx, SIPSIN_PERSON[cell.sipsin], CARD_W / 2, y + 70, 50, AMBER, 700);
    stars(ctx, cell.stars, CARD_W / 2, y + 135, 44);
  };
  direction(a, b, ab, 620);
  direction(b, a, ba, 850);

  [a, b].forEach((p, i) => {
    const el = p.ilgan.element;
    text(ctx, `${p.name} — ${ILGAN_IMAGE[p.ilgan.cg]}(${el}) · ${p.sun.sign}`, CARD_W / 2, 1150 + i * 56, 32, elColor(el), 600);
  });
}
