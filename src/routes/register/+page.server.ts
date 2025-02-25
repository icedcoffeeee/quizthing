import type { Actions, PageServerLoadEvent } from "./$types";
import { db, users_ } from "$lib/server";
import { redirect } from "@sveltejs/kit";
import { zfd } from "zod-form-data";
import { eq } from "drizzle-orm";

export async function load({ url, parent }: PageServerLoadEvent) {
  const { userID } = await parent();
  if (userID) redirect(303, url.searchParams.get("redirect") ?? "/");
}

export const actions: Actions = {
  async register({ request, cookies }) {
    const { name: name_, url: url_ } = zfd
      .formData({ name: zfd.text(), url: zfd.text() })
      .parse(await request.formData());
    const name = name_.toLowerCase();
    const url = new URL(url_)

    let user = await db.query.users_.findFirst({ where: eq(users_.name, name) });
    if (!user) user = (await db.insert(users_).values({ name }).returning())[0];
    cookies.set("user", user.id.toString(), {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      secure: import.meta.env.PROD,
    });
    redirect(303, url.searchParams.get("redirect") ?? "/");
  },
};
