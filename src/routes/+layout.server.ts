import { client } from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";
import type { Actions, LayoutServerLoadEvent } from "./$types";

export async function load({ locals: { user } }: LayoutServerLoadEvent) {
  if (user.username === "admin") return { admin: user };
  return { user };
}

export const actions: Actions = {
  async login() {
    const host = import.meta.env.BASE_URL;
    const protocol = import.meta.env.DEV ? "http" : "https";
    const { url } = await client.authorize(`${protocol}://${host}/callback`, "code");
    redirect(302, url);
  },
  async logout() {},
};
