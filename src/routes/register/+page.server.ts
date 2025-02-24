import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoadEvent } from "./$types";
import { zfd } from "zod-form-data";
import { db, participants_ } from "$lib/server";

export async function load({ url, parent }: PageServerLoadEvent) {
  const { userID } = await parent();
  if (userID) redirect(303, url.searchParams.get("redirect") ?? "/");
}

export const actions: Actions = {
  async register({ request, url, cookies }) {
    const { name } = zfd.formData({ name: zfd.text() }).parse(await request.formData());
    const user = (await db.insert(participants_).values({ name }).$returningId())[0];
    cookies.set("user", user.id.toString(), {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      secure: import.meta.env.PROD,
    });
    redirect(303, url.searchParams.get("redirect") ?? "/");
  },
};
