import { glossaryRows } from "@/lib/engine/glossary";
import { TableWrap } from "./ui";

export default function Glossary() {
  const rows = glossaryRows();
  return (
    <details className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <summary className="cursor-pointer text-sm font-medium text-white/70 select-none">용어 풀이 (궁금할 때만 펼쳐 보세요)</summary>
      <TableWrap>
        <table className="mt-4 w-full text-sm min-w-[320px]">
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k} className="border-t border-white/5 align-top">
                <td className="py-1.5 pr-4 font-medium text-white/80 whitespace-nowrap">{k}</td>
                <td className="py-1.5 text-white/55 leading-relaxed">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>
    </details>
  );
}
