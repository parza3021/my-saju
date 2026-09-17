import Link from "next/link";

export default function SiteNav({ active }: { active: "saju" | "gunghap" }) {
  const tabs = [
    { href: "/", key: "saju", label: "내 사주 보기" },
    { href: "/gunghap", key: "gunghap", label: "궁합 보기" },
  ] as const;

  return (
    <div className="flex justify-center gap-2 mb-10">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            active === tab.key
              ? "bg-amber-400 text-neutral-900"
              : "bg-white/10 text-white/70 hover:bg-white/20"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
