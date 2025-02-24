import type { Actions } from "./$types";
import { db, quizzes_ } from "$lib/server";
import { eq } from "drizzle-orm";
import { zfd } from "zod-form-data";

export async function load() {
  const quizzes = await db.query.quizzes_.findMany({
    with: { users_bridge: true, questions: true },
  });
  return { quizzes };
}

export const actions: Actions = {
  async addquiz() {
    const full = new Date().getTime().toString();
    const code = full.substring(full.length - 9, full.length - 3);
    await db.insert(quizzes_).values({ code });
  },

  async delquiz({ request }) {
    const { quizCode } = zfd.formData({ quizCode: zfd.text() }).parse(await request.formData());
    await db.delete(quizzes_).where(eq(quizzes_.code, quizCode));
  },
};
