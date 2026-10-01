import type { SVGProps } from "react";

// lucide-react marka ikonlarını kaldırdığı için Instagram ikonu burada tanımlı.
export function Instagram(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}

/** WhatsApp benzeri konuşma balonu + ahize (marka logosunun sade, çizgisel yorumu). */
export function WhatsApp(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 21l1.65-4.6A9 9 0 1 1 7.6 19.4Z" />
      <path d="M9 8.5c0 3.6 2.9 6.5 6.5 6.5l1-1.4-2-1-.9.8a3.8 3.8 0 0 1-3-3l.8-.9-1-2Z" fill="currentColor" strokeWidth={1} />
    </svg>
  );
}
