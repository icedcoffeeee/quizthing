import { redirect, type Actions, type ServerLoadEvent } from "@sveltejs/kit";

export function load({ cookies }: ServerLoadEvent) {
  if (cookies.get("logged")) redirect(307, "admin");
}

export const actions: Actions = {
  async default({ request }) {
    const { quizCode } = Object.fromEntries(await request.formData()) as any;
    if (quizCode) redirect(303, quizCode);
  },
};
