import type { ReactNode } from "react";

/**
 * Panelden girilen düz metni paragraflara böler. Boş satırla ayrılan bloklar paragraf olur;
 * "## " ile başlayan satırlar (bloğun neresinde olursa olsun) ara başlığa dönüşür. HTML yorumlanmaz.
 */
export function RichText({ text, className }: { text: string; className?: string }) {
  const nodes: ReactNode[] = [];
  text.split(/\r?\n\s*\r?\n/).forEach((block, b) => {
    let paragraph: string[] = [];
    const flush = (key: string) => {
      const p = paragraph.join("\n").trim();
      if (p)
        nodes.push(
          <p key={key} className="whitespace-pre-line">
            {p}
          </p>,
        );
      paragraph = [];
    };
    block.split(/\r?\n/).forEach((line, l) => {
      if (line.trim().startsWith("## ")) {
        flush(`${b}-${l}p`);
        nodes.push(
          <h3 key={`${b}-${l}h`} className="mt-2 font-display text-headline-sm font-semibold text-ink">
            {line.trim().slice(3).trim()}
          </h3>,
        );
      } else paragraph.push(line);
    });
    flush(`${b}-end`);
  });
  return <div className={className}>{nodes}</div>;
}
