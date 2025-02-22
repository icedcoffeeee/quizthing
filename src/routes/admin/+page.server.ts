import { type Actions } from "@sveltejs/kit";
import { answers_, db, questions_, quizzes_ } from "$lib/server";
import { zfd } from "zod-form-data";
import { eq, inArray } from "drizzle-orm";

export async function load() {
  const quizzes = await db.query.quizzes_.findMany();
  const questionsL = await Promise.all(
    quizzes.map((q) =>
      db.query.questions_
        .findMany({ where: ({ quizID }, { eq }) => eq(quizID, q.id) })
        .then((r) => r.length),
    ),
  );

  return { quizzes, questionsL };
}

export const actions: Actions = {
  async addquiz() {
    const full = new Date().getTime().toString();
    const code = full.substring(full.length - 9, full.length - 3);
    await db.insert(quizzes_).values({ code });
  },
  async delquiz({ request }) {
    const schema = zfd.formData({ quizID: zfd.numeric() });
    const { quizID } = schema.parse(await request.formData());

    await db.query.questions_
      .findMany({
        where: ({ quizID }, { eq }) => eq(quizID, quizID),
      })
      .then((q) =>
        db.delete(answers_).where(
          inArray(
            answers_.questionID,
            q.map((i) => i.id),
          ),
        ),
      );
    await Promise.all([
      db.delete(quizzes_).where(eq(quizzes_.id, quizID)),
      db.delete(questions_).where(eq(questions_.quizID, quizID)),
    ]);
  },
};
