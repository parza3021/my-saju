"use client";

import { CARD_H, CARD_W } from "./shareCard";

/** 결과 카드를 그려 휴대폰 공유 창(카톡·인스타 등)으로 보내고, 공유를 못 하는 브라우저에서는 PNG로 내려받는다 */
export default function ShareButton({ draw, fileName }: { draw: (ctx: CanvasRenderingContext2D) => void; fileName: string }) {
  async function share() {
    const canvas = document.createElement("canvas");
    canvas.width = CARD_W;
    canvas.height = CARD_H;
    draw(canvas.getContext("2d")!);
    // toBlob 콜백은 탭 상태에 따라 1초 가까이 늦게 와서, 동기 인코딩(toDataURL)을 쓴다 — 공유 창은 클릭 직후에만 열린다
    const blob = await (await fetch(canvas.toDataURL("image/png"))).blob();
    const file = new File([blob], fileName, { type: "image/png" });

    if (navigator.canShare?.({ files: [file] })) {
      // 사용자가 공유 창을 닫으면 AbortError — 실패가 아니므로 무시
      await navigator.share({ files: [file] }).catch(() => {});
      return;
    }
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url));
  }

  return (
    <button
      type="button"
      onClick={share}
      className="rounded-lg bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 px-3 py-1.5 text-sm text-amber-300 transition-colors"
    >
      결과 이미지 공유
    </button>
  );
}
