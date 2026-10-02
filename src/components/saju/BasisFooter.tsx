// 산출 기준·한계·개인정보 — render_report.py 의 footer 를 앱에 맞게 옮겼다.
export default function BasisFooter({ withScore = false }: { withScore?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-xs text-white/45 leading-relaxed space-y-2">
      <p>
        <b className="text-white/60">어떻게 계산했나요.</b> 한국천문연구원 음력·절기 자료와 대조해 검증한 만세력 계산으로 여덟 글자를 구했습니다.
        태어난 시각은 실제 해의 위치에 맞춰 약 32분을 보정했고(동경 127° 기준), 1950~60년대 표준시 변경과 서머타임 기간도 반영했습니다.
        밤 11시 30분 무렵 이후 출생은 다음 날로 봅니다(정자시 통합).
      </p>
      {withScore && (
        <p>
          <b className="text-white/60">별점은 어떻게 매기나요.</b> 3점에서 시작해, 상대가 나에게 어떤 사람인지(든든하게 챙겨 주는 사람 +1 ~ 괜히 긴장되는 사람 −1),
          두 사람의 &lsquo;나&rsquo; 글자끼리 끌리는지 부딪히는지(±1), 일상 자리 글자끼리의 반응(끌림 +1, 정면 부딪힘 −1.5 등), 나머지 자리의 반응(작게 가감),
          상대가 나를 돕는 자리의 글자를 가졌는지(+0.5)를 더한 뒤 1~5점으로 반올림합니다. 같은 생년월일시면 누가 계산해도 같은 별점이 나옵니다.
        </p>
      )}
      <p>
        <b className="text-white/60">두 방법.</b> 사주와 서양 별자리는 서로 관계없는 두 방법입니다. 둘이 같은 말을 한다고 더 정확해지는 것은 아니며,
        한쪽만 말하는 내용은 가볍게 읽으시길 권합니다.
      </p>
      <p>
        <b className="text-white/60">한계.</b> 태어난 시각이 30분만 달라도 글자가 바뀔 수 있습니다. 사주는 재미로 보는 전통 해석이며 검증된 예측이 아닙니다.
        이 결과를 채용·인사 평가·연인이나 배우자 선택의 근거로 쓰지 마세요.
      </p>
      <p>
        <b className="text-white/60">개인정보.</b> 입력한 생년월일시는 이 브라우저 안에서만 계산되며 서버로 전송하거나 저장하지 않습니다.
      </p>
    </div>
  );
}
