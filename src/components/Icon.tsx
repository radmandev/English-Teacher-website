const paths = {
  search: "M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm10 2-4.35-4.35",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "M6 6l12 12M18 6 6 18",
  heart: "M12 20s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9Z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4l3 2",
  book: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Zm0 16a2 2 0 0 1 2-2h13",
  check: "m5 12 5 5 9-10",
  star: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3Z",
  play: "M8 5v14l11-7L8 5Z",
  lock: "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5V11Z",
  prev: "m9 6 6 6-6 6", // points right = "previous" in RTL
  next: "m15 6-6 6 6 6", // points left = "next" in RTL
  bulb: "M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3Z",
  chart: "M4 20V10m6 10V4m6 16v-7m4 7H2",
  target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-4a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0",
  volume: "M4 10v4h4l5 4V6L8 10H4Zm12-1a4 4 0 0 1 0 6m2.5-8.5a7.5 7.5 0 0 1 0 11",
  layers: "m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5",
  cart: "M3 4h2l2.4 11h10.2L20 8H6.2M9 20h.01M17 20h.01",
  chevron: "m6 9 6 6 6-6",
  filter: "M4 6h16M7 12h10M10 18h4",
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, className = "size-5", filled = false }: { name: IconName; className?: string; filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  );
}
