import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "내 사주 - 정통 명리학 사주팔자 & 별자리 풀이",
  description:
    "생년월일시를 입력하면 사주팔자 원국, 오행 분포, 일간 성격, 서양 별자리까지 즉시 확인할 수 있는 사주 풀이 서비스입니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-950">{children}</body>
    </html>
  );
}
