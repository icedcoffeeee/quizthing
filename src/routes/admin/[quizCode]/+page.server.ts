import type { Actions, PageServerLoadEvent, RequestEvent } from "./$types";
import { and, asc, eq, gt, gte, lt, lte, sql } from "drizzle-orm";
import { answers_, db, questions_, quizzes_ } from "$lib/server";
import { error, redirect } from "@sveltejs/kit";
import { zfd } from "zod-form-data";

export async function load({ params: { quizCode } }: PageServerLoadEvent) {
  if (!quizCode) redirect(303, "/admin");

  const quiz = await db.query.quizzes_.findFirst({
    where: eq(quizzes_.code, quizCode),
    with: { questions: { orderBy: asc(questions_.index), with: { answers: true } } },
  });
  if (!quiz) error(404, "quiz not found");

  return { quiz };
}

export const actions: Actions = {
  async addquestion({ request }: RequestEvent) {
    const { quizCode } = zfd.formData({ quizCode: zfd.text() }).parse(await request.formData());

    const questionsL = (await db.query.quizzes_.findFirst({
      where: eq(quizzes_.code, quizCode),
      with: { questions: true },
    }))!.questions.length;

    await db.insert(questions_).values({ quizCode, index: questionsL + 1 });
  },

  async delquestion({ request }: RequestEvent) {
    const { questionID } = zfd
      .formData({ questionID: zfd.numeric() })
      .parse(await request.formData());

    const question = (await db.query.questions_.findFirst({
      where: eq(questions_.id, questionID),
    }))!;

    await db.delete(answers_).where(eq(answers_.questionID, question.id));
    await db
      .update(questions_)
      .set({ index: sql`${questions_.index} - 1` })
      .where(gt(questions_.index, question.index));
    await db.delete(questions_).where(eq(questions_.id, questionID));
  },

  async addanswer({ request }: RequestEvent) {
    const { questionID } = zfd
      .formData({ questionID: zfd.numeric() })
      .parse(await request.formData());

    const question = (await db.query.questions_.findFirst({
      where: eq(questions_.id, questionID),
    }))!;

    await db.insert(answers_).values({ questionID: question.id });
  },

  async delanswer({ request }: RequestEvent) {
    const { answerID } = zfd.formData({ answerID: zfd.numeric() }).parse(await request.formData());

    await db.delete(answers_).where(eq(answers_.id, answerID));
  },

  async coranswer({ request }: RequestEvent) {
    const { questionID, answerID: correctID } = zfd
      .formData({ questionID: zfd.numeric(), answerID: zfd.numeric() })
      .parse(await request.formData());

    await db.update(questions_).set({ correctID }).where(eq(questions_.id, questionID));
  },

  async changequizname({ request }: RequestEvent) {
    const { quizCode, name } = zfd
      .formData({ quizCode: zfd.text(), name: zfd.text() })
      .parse(await request.formData());

    await db.update(quizzes_).set({ name }).where(eq(quizzes_.code, quizCode));
  },

  async changequestiontitle({ request }: RequestEvent) {
    const { questionID, title } = zfd
      .formData({ questionID: zfd.numeric(), title: zfd.text() })
      .parse(await request.formData());

    await db.update(questions_).set({ title }).where(eq(questions_.id, questionID));
  },

  async changeanswertitle({ request }: RequestEvent) {
    const { answerID, title } = zfd
      .formData({ answerID: zfd.numeric(), title: zfd.text() })
      .parse(await request.formData());

    await db.update(answers_).set({ title }).where(eq(answers_.id, answerID));
  },

  async changequestionorder({ request }: RequestEvent) {
    const { questionID, oldIndex, newIndex } = zfd
      .formData({ questionID: zfd.numeric(), oldIndex: zfd.numeric(), newIndex: zfd.numeric() })
      .parse(await request.formData());

    if (newIndex < oldIndex)
      await db
        .update(questions_)
        .set({ index: sql`${questions_.index} + 1` })
        .where(and(gte(questions_.index, newIndex), lt(questions_.index, oldIndex)));
    if (newIndex > oldIndex)
      await db
        .update(questions_)
        .set({ index: sql`${questions_.index} - 1` })
        .where(and(lte(questions_.index, newIndex), gt(questions_.index, oldIndex)));
    await db.update(questions_).set({ index: newIndex }).where(eq(questions_.id, questionID));
  },

  async togglestatus({ request }: RequestEvent) {
    const { quizCode } = zfd.formData({ quizCode: zfd.text() }).parse(await request.formData());

    const quiz = (await db.query.quizzes_.findFirst({
      where: eq(quizzes_.code, quizCode),
      with: { questions: true },
    }))!;
    if (quiz.status >= 0) {
      await db.update(quizzes_).set({ status: -1 }).where(eq(quizzes_.code, quizCode));
      return;
    }

    if (quiz.questions.some((q) => !q.correctID))
      return { error: "choose correct answers for each question!" };

    await db.update(quizzes_).set({ status: 0 }).where(eq(quizzes_.code, quizCode));
    redirect(303, `/${quiz.code}`);
  },
};
