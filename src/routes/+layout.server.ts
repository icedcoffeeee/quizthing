import { ADMIN_PASSWORD } from "$env/static/private";
import type { ServerLoadEvent } from "@sveltejs/kit";

export function load({ cookies }: ServerLoadEvent) {
  const admin = cookies.get("admin") === ADMIN_PASSWORD;
  return { admin };
}
