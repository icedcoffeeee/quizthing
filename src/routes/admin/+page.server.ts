import { type Actions } from "@sveltejs/kit";
import { answers, db, questions, quizzes } from "$lib/server";
import { zfd } from "zod-form-data";
import { eq, inArray } from "drizzle-orm";

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
  async delquiz({ request }) {
    const schema = zfd.formData({ quizID: zfd.numeric() });
    const { quizID } = schema.parse(await request.formData());

    await db.query.questions
      .findMany({
        where: ({ quizID: quizID_ }, { eq }) => eq(quizID_, quizID),
      })
      .then((q) =>
        db.delete(answers).where(
          inArray(
            answers.questionID,
            q.map((i) => i.id),
          ),
        ),
      );
    await Promise.all([
      db.delete(quizzes).where(eq(quizzes.id, quizID)),
      db.delete(questions).where(eq(questions.quizID, quizID)),
    ]);
  },
};
