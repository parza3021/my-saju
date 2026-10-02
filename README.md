This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 계산 기준

사주·궁합·일진은 `src/lib/engine/` 의 만세력 엔진으로 계산합니다. 사용자가 만든 `saju-iljin-doc` 스킬의 Python 엔진
(`manseryeok.py`, `relations.py`, `compute_group.py`, `compute_iljin.py`)을 TypeScript로 옮긴 것입니다.

- **원국**: 태양 황경(VSOP87)으로 절입 시각을 구하고, 출생 시각에 **경도 보정(동경 127°, 약 −32분)** 을 적용합니다. 23시 이후는 다음 날로 보는 **정자시 통합**이 기본값입니다. 1954~61년 UTC+8:30과 서머타임도 반영합니다.
- **음력**: 합삭 + 중기로 한국 음력(KST)을 계산해 양력으로 바꿉니다(윤달 포함).
- **지지 관계**: 술–미는 **파(破)만**, 반합은 자·오·묘·유가 낀 두 글자만 인정합니다.
- **별점**: 3점에서 시작해 십신·일간합충·일지 관계·나머지 자리 관계·귀인을 더하고 1~5점으로 반올림합니다(공식은 `src/lib/engine/relations.ts` 의 `score()`).

### 테스트

```bash
npm test
```

파이썬 스킬 엔진이 만든 값을 정답으로 삼아 대조합니다(원국·절입·음력·대운·관계·별점·일진). 정답 파일(`src/lib/engine/__fixtures__/*.json`)은 아래 명령으로 다시 만들 수 있습니다.

```bash
python3 scripts/gen-fixtures.py <saju-iljin-doc 스킬 폴더>
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
