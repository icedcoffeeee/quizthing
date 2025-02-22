import { redirect, type ServerLoadEvent } from "@sveltejs/kit";

export async function load({ parent }: ServerLoadEvent) {
  const { admin } = await parent();
  if (!admin) redirect(307, "/");
}
