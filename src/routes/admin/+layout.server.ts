import type { LayoutServerLoadEvent } from "./$types";
import { redirect } from "@sveltejs/kit";

export async function load({ parent }: LayoutServerLoadEvent) {
  const { admin } = await parent();
  if (!admin) redirect(307, "/");
}
