export function clamp(v: string | number, a: string | number, b: string | number) {
  const [c, d, e] = [v, a, b].map((i) => (typeof i === "string" ? parseInt(i) : (i as number)));
  return Math.min(Math.max(c, d), e);
}
