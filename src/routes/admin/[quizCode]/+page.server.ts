import { answers, db, questions, quizzes } from "$lib/server";
import { error, redirect, type Actions, type ServerLoadEvent } from "@sveltejs/kit";
import { and, eq, gt, gte, lt, lte, sql } from "drizzle-orm";
import { zfd } from "zod-form-data";

export async function load({ params: { quizCode } }: ServerLoadEvent) {
  if (!quizCode) redirect(303, "/admin");

  const quiz = await db.query.quizzes.findFirst({
    where: ({ code }, { eq }) => eq(code, quizCode),
  });
  if (!quiz) error(404, "quiz not found");

  const questions_ = await db.query.questions.findMany({
    where: ({ quizID }, { eq }) => eq(quizID, quiz.id),
    orderBy: ({ index }, { asc }) => asc(index),
  });
  const answers_ = await Promise.all(
    questions_.map((q) =>
      db.query.answers.findMany({
        where: ({ questionID }, { eq }) => eq(questionID, q.id),
      }),
    ),
  );

  return { quiz, questions: questions_, answers: answers_ };
}

export const actions: Actions = {
  async addquestion({ request }) {
    const schema = zfd.formData({ quizID: zfd.numeric() });
    const { quizID } = schema.parse(await request.formData());

    const quiz = (await db.query.quizzes.findFirst({
      where: ({ id }, { eq }) => eq(id, quizID),
    }))!;
    const questionsL = (
      await db.query.questions.findMany({
        where: ({ quizID: quizID_ }, { eq }) => eq(quizID_, quizID),
      })
    ).length;

    await db.insert(questions).values({ quizID: quiz.id, index: questionsL + 1 });
  },
  async delquestion({ request }) {
    const schema = zfd.formData({ questionID: zfd.numeric() });
    const { questionID } = schema.parse(await request.formData());

    const question = (await db.query.questions.findFirst({
      where: ({ id }, { eq }) => eq(id, questionID),
    }))!;
    await db.delete(answers).where(eq(answers.questionID, question.id));
    await db
      .update(questions)
      .set({ index: sql`${questions.index} - 1` })
      .where(gt(questions.index, question.index));
    await db.delete(questions).where(eq(questions.id, questionID));
  },

  async addanswer({ request }) {
    const schema = zfd.formData({ questionID: zfd.numeric() });
    const { questionID } = schema.parse(await request.formData());

    const question = (await db.query.questions.findFirst({
      where: ({ id }, { eq }) => eq(id, questionID),
    }))!;

    await db.insert(answers).values({ questionID: question.id }).$returningId();
  },
  async delanswer({ request }) {
    const schema = zfd.formData({ answerID: zfd.numeric() });
    const { answerID } = schema.parse(await request.formData());

    await db.delete(answers).where(eq(answers.id, answerID));
  },
  async coranswer({ request }) {
    const schema = zfd.formData({ questionID: zfd.numeric(), answerID: zfd.numeric() });
    const { questionID, answerID: correctID } = schema.parse(await request.formData());

    await db.update(questions).set({ correctID }).where(eq(questions.id, questionID));
  },

  async changequizname({ request }) {
    const schema = zfd.formData({ quizID: zfd.numeric(), name: zfd.text() });
    const { quizID, name } = schema.parse(await request.formData());

    await db.update(quizzes).set({ name }).where(eq(quizzes.id, quizID));
  },
  async changequestiontitle({ request }) {
    const schema = zfd.formData({ questionID: zfd.numeric(), title: zfd.text() });
    const { questionID, title } = schema.parse(await request.formData());

    await db.update(questions).set({ title }).where(eq(questions.id, questionID));
  },
  async changeanswertitle({ request }) {
    const schema = zfd.formData({ answerID: zfd.numeric(), title: zfd.text() });
    const { answerID, title } = schema.parse(await request.formData());

    await db.update(answers).set({ title }).where(eq(answers.id, answerID));
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
        .update(questions)
        .set({ index: sql`${questions.index} + 1` })
        .where(and(gte(questions.index, newIndex), lt(questions.index, oldIndex)));
    if (newIndex > oldIndex)
      await db
        .update(questions)
        .set({ index: sql`${questions.index} - 1` })
        .where(and(lte(questions.index, newIndex), gt(questions.index, oldIndex)));
    await db.update(questions).set({ index: newIndex }).where(eq(questions.id, questionID));
  },

  async togglestatus({ request }) {
    const schema = zfd.formData({ quizID: zfd.numeric() });
    const { quizID } = schema.parse(await request.formData());

    const quiz = (await db.query.quizzes.findFirst({ where: ({ id }, { eq }) => eq(id, quizID) }))!;
    if (quiz.status >= 0) {
      await db.update(quizzes).set({ status: -1 }).where(eq(quizzes.id, quizID));
      return;
    }

    // TODO: check qualifications
    await db.update(quizzes).set({ status: 0 }).where(eq(quizzes.id, quizID));
    redirect(303, `/${quiz.code}`);
  },
};
