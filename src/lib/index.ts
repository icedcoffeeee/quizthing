import { invalidateAll } from "$app/navigation";

export function getQuizStatus(status: number) {
  switch (status) {
    case -1:
      return "off";
    case 0:
      return "waiting";
    default:
      return `on question ${Math.floor(status)}`;
  }
}

export function manualFetch(action: string, data: any) {
  fetch(action, { method: "post", body: new URLSearchParams(data) });
  invalidateAll();
}

export function clamp(v: string | number, a: string | number, b: string | number) {
  const [c, d, e] = [v, a, b].map((i) => (typeof i === "string" ? parseInt(i) : (i as number)));
  return Math.min(Math.max(c, d), e);
}
