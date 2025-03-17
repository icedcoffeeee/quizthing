import { ADMIN_EMAIL } from "$env/static/private";
import type { LayoutServerLoadEvent } from "./$types";

export async function load({ locals: { user } }: LayoutServerLoadEvent) {
  console.log(user);
  if (user && user.email === ADMIN_EMAIL) return { admin: user };
  return { user };
}
