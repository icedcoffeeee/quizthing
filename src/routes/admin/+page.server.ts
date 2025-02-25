import type { Actions } from "./$types";
import { answers_, db, questions_, quizzes_, users_ } from "$lib/server";
import { count, eq, inArray } from "drizzle-orm";
import { zfd } from "zod-form-data";

export async function load() {
  const quizzes = await db.query.quizzes_.findMany();
  const [questionsL, usersL] = await Promise.all([
    Promise.all(
      quizzes.map((quiz) =>
        db
          .select({ count: count() })
          .from(questions_)
          .where(inArray(questions_.id, quiz.questionIDs)),
      ),
    ),
    Promise.all(
      quizzes.map((quiz) =>
        db.select({ count: count() }).from(users_).where(inArray(users_.id, quiz.userIDs)),
      ),
    ),
  ]).then((a) => a.flat().map((a) => a.flat().map((b) => b.count)));
  return { quizzes, questionsL, usersL };
}

export const actions: Actions = {
  async addquiz() {
    const full = new Date().getTime().toString();
    const code = full.substring(full.length - 9, full.length - 3);
    await db.insert(quizzes_).values({ code });
  },

  async delquiz({ request }) {
    const { quizCode } = zfd.formData({ quizCode: zfd.text() }).parse(await request.formData());

    const quiz = await db.delete(quizzes_).where(eq(quizzes_.code, quizCode)).returning();
    const questions = await db
      .delete(questions_)
      .where(inArray(questions_.id, quiz[0].questionIDs))
      .returning();
    await Promise.all(
      questions.map((q) => db.delete(answers_).where(inArray(answers_.id, q.answerIDs))),
    );
  },
};
