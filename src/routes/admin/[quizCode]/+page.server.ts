import { answers_, db, questions_, quizzes_ } from "$lib/server";
import { error, redirect, type Actions, type ServerLoadEvent } from "@sveltejs/kit";
import { and, eq, gt, gte, lt, lte, sql } from "drizzle-orm";
import { zfd } from "zod-form-data";

export async function load({ params: { quizCode } }: ServerLoadEvent) {
  if (!quizCode) redirect(303, "/admin");

  const quiz = await db.query.quizzes_.findFirst({
    where: ({ code }, { eq }) => eq(code, quizCode),
  });
  if (!quiz) error(404, "quiz not found");

  const questions = await db.query.questions_.findMany({
    where: ({ quizID }, { eq }) => eq(quizID, quiz.id),
    orderBy: ({ index }, { asc }) => asc(index),
  });
  const answers = await Promise.all(
    questions.map((q) =>
      db.query.answers_.findMany({
        where: ({ questionID }, { eq }) => eq(questionID, q.id),
      }),
    ),
  );

  return { quiz, questions, answers };
}

export const actions: Actions = {
  async addquestion({ request }) {
    const schema = zfd.formData({ quizID: zfd.numeric() });
    const { quizID } = schema.parse(await request.formData());

    const quiz = (await db.query.quizzes_.findFirst({
      where: ({ id }, { eq }) => eq(id, quizID),
    }))!;
    const questions_L = (
      await db.query.questions_.findMany({
        where: ({ quizID: quizID_ }, { eq }) => eq(quizID_, quizID),
      })
    ).length;

    await db.insert(questions_).values({ quizID: quiz.id, index: questions_L + 1 });
  },
  async delquestion({ request }) {
    const schema = zfd.formData({ questionID: zfd.numeric() });
    const { questionID } = schema.parse(await request.formData());

    const question = (await db.query.questions_.findFirst({
      where: ({ id }, { eq }) => eq(id, questionID),
    }))!;
    await db.delete(answers_).where(eq(answers_.questionID, question.id));
    await db
      .update(questions_)
      .set({ index: sql`${questions_.index} - 1` })
      .where(gt(questions_.index, question.index));
    await db.delete(questions_).where(eq(questions_.id, questionID));
  },

  async addanswer({ request }) {
    const schema = zfd.formData({ questionID: zfd.numeric() });
    const { questionID } = schema.parse(await request.formData());

    const question = (await db.query.questions_.findFirst({
      where: ({ id }, { eq }) => eq(id, questionID),
    }))!;

    await db.insert(answers_).values({ questionID: question.id }).$returningId();
  },
  async delanswer({ request }) {
    const schema = zfd.formData({ answerID: zfd.numeric() });
    const { answerID } = schema.parse(await request.formData());

    await db.delete(answers_).where(eq(answers_.id, answerID));
  },
  async coranswer({ request }) {
    const schema = zfd.formData({ questionID: zfd.numeric(), answerID: zfd.numeric() });
    const { questionID, answerID: correctID } = schema.parse(await request.formData());

    await db.update(questions_).set({ correctID }).where(eq(questions_.id, questionID));
  },

  async changequizname({ request }) {
    const schema = zfd.formData({ quizID: zfd.numeric(), name: zfd.text() });
    const { quizID, name } = schema.parse(await request.formData());

    await db.update(quizzes_).set({ name }).where(eq(quizzes_.id, quizID));
  },
  async changequestiontitle({ request }) {
    const schema = zfd.formData({ questionID: zfd.numeric(), title: zfd.text() });
    const { questionID, title } = schema.parse(await request.formData());

    await db.update(questions_).set({ title }).where(eq(questions_.id, questionID));
  },
  async changeanswertitle({ request }) {
    const schema = zfd.formData({ answerID: zfd.numeric(), title: zfd.text() });
    const { answerID, title } = schema.parse(await request.formData());

    await db.update(answers_).set({ title }).where(eq(answers_.id, answerID));
  },

  async changequestionorder({ request }) {
    const schema = zfd.formData({
      questionID: zfd.numeric(),
      oldIndex: zfd.numeric(),
      newIndex: zfd.numeric(),
    });
    const { questionID, oldIndex, newIndex } = schema.parse(await request.formData());

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

  async togglestatus({ request }) {
    const schema = zfd.formData({ quizID: zfd.numeric() });
    const { quizID } = schema.parse(await request.formData());

    const quiz = (await db.query.quizzes_.findFirst({
      where: ({ id }, { eq }) => eq(id, quizID),
    }))!;
    if (quiz.status >= 0) {
      await db.update(quizzes_).set({ status: -1 }).where(eq(quizzes_.id, quizID));
      return;
    }

    // TODO: check qualifications
    await db.update(quizzes_).set({ status: 0 }).where(eq(quizzes_.id, quizID));
    redirect(303, `/${quiz.code}`);
  },
};
