import { redirect, type Actions, type ServerLoadEvent } from "@sveltejs/kit";
import { zfd } from "zod-form-data";

export async function load({ parent }: ServerLoadEvent) {
  const { admin } = await parent();
  if (admin) redirect(307, "/admin");
}

export const actions: Actions = {
  async default({ request }) {
    const schema = zfd.formData({ quizCode: zfd.text() });
    const { quizCode } = schema.parse(await request.formData());
    if (quizCode) redirect(303, quizCode);
  },
};
