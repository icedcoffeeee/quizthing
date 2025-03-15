import type { Actions, PageServerLoadEvent } from "./$types";
import { client, removeTokens } from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";
import { zfd } from "zod-form-data";

export async function load({ parent }: PageServerLoadEvent) {
  const { admin } = await parent();
  if (admin) redirect(307, "/admin");
}

export const actions: Actions = {
  async gotoquiz({ request }) {
    const schema = zfd.formData({ quizCode: zfd.text() });
    const { quizCode } = schema.parse(await request.formData());
    if (quizCode) redirect(302, quizCode);
  },
  async login({ url }) {
    const { url: callback } = await client.authorize(
      `${url.protocol}//${url.host}/callback`,
      "code",
    );
    redirect(302, callback);
  },
  async logout({ cookies }) {
    await removeTokens(cookies);
    redirect(302, "/");
  },
};
