import type { LayoutServerLoadEvent } from "./$types";
import { ADMIN_PASSWORD } from "$env/static/private";

export function load({ cookies }: LayoutServerLoadEvent) {
  const admin = cookies.get("admin") === ADMIN_PASSWORD;
  const userID = parseInt(cookies.get("user") ?? "");
  return { admin, userID: !userID ? undefined : userID };
}
