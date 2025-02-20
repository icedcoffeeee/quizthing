import { type Actions } from "@sveltejs/kit";
import { db, quizzes } from "$lib/server";

export async function load() {
  const quizzes_ = await db.query.quizzes.findMany();
  const questionsL = await Promise.all(
    quizzes_.map((q) =>
      db.query.questions
        .findMany({ where: ({ quizID }, { eq }) => eq(quizID, q.id) })
        .then((r) => r.length),
    ),
  );

  return { quizzes: quizzes_, questionsL };
}

export const actions: Actions = {
  async addquiz() {
    const full = new Date().getTime().toString();
    const code = full.substring(full.length - 9, full.length - 3);
    await db.insert(quizzes).values({ code });
  },
};
