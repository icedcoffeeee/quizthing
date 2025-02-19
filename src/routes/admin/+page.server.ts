import { ADMIN_PASSWORD } from "$env/static/private";
import { redirect, type ServerLoadEvent } from "@sveltejs/kit";

export function load({ cookies }: ServerLoadEvent) {
  if (cookies.get("logged") !== ADMIN_PASSWORD) redirect(307, "/");
}
