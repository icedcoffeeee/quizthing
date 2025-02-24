import type { Actions, PageServerLoadEvent } from "./$types";
import { redirect } from "@sveltejs/kit";
import { zfd } from "zod-form-data";

export async function load({ parent }: PageServerLoadEvent) {
  const { admin } = await parent();
  if (admin) redirect(307, "/admin");
}

export const actions: Actions = {
  async default({ request }) {
    const schema = zfd.formData({ quizCode: zfd.text() });
    const { quizCode } = schema.parse(await request.formData());
    if (quizCode) redirect(302, quizCode);
  },
};
