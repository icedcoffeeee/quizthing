import type { Actions, PageServerLoadEvent, RequestEvent } from "./$types";
import { and, asc, eq, gt, gte, inArray, lt, lte, sql } from "drizzle-orm";
import { answers_, db, questions_, quizzes_, users_, type Question, type Quiz } from "$lib/server";
import { error, redirect } from "@sveltejs/kit";
import { zfd } from "zod-form-data";

export async function load({ params: { quizCode } }: PageServerLoadEvent) {
  if (!quizCode) redirect(303, "/admin");

  const quiz = await db.query.quizzes_.findFirst({ where: eq(quizzes_.code, quizCode) });
  if (!quiz) error(404, "quiz not found");
  const questions = await db.query.questions_.findMany({
    where: inArray(questions_.id, quiz.questionIDs),
    orderBy: asc(questions_.index),
  });
  const answers = await Promise.all(
    questions.map((q) => db.query.answers_.findMany({ where: inArray(answers_.id, q.answerIDs) })),
  );
  const users = await db.query.users_.findMany({ where: inArray(users_.id, quiz.userIDs) });

  return { quiz, questions, answers, users };
}

export const actions: Actions = {
  async addquestion({ request }: RequestEvent) {
    const { quizCode, lastIndex } = zfd
      .formData({ quizCode: zfd.text(), lastIndex: zfd.numeric() })
      .parse(await request.formData());

    const question = await db
      .insert(questions_)
      .values({ index: lastIndex + 1 })
      .returning();
    await db
      .update(quizzes_)
      .set({ questionIDs: sql`array_append(${quizzes_.questionIDs}, ${question[0].id})` })
      .where(eq(quizzes_.code, quizCode));
  },

  async delquestion({ request }: RequestEvent) {
    const { quizCode, questionID } = zfd
      .formData({ quizCode: zfd.text(), questionID: zfd.numeric() })
      .parse(await request.formData());

    const [quiz, question]: [Quiz | undefined, Question | undefined] = await Promise.all([
      db.query.quizzes_.findFirst({
        where: eq(quizzes_.code, quizCode),
      }),
      db.query.questions_.findFirst({
        where: eq(questions_.id, questionID),
      }),
    ]);
    if (!quiz || !question) return;

    await Promise.all([
      db.delete(answers_).where(inArray(answers_.id, question.answerIDs)),
      db
        .update(questions_)
        .set({ index: sql`${questions_.index} - 1` })
        .where(and(gt(questions_.index, question.index), inArray(questions_.id, quiz.questionIDs))),
      db
        .update(quizzes_)
        .set({ questionIDs: sql`array_remove(${quizzes_.questionIDs}, ${questionID})` })
        .where(and(gt(questions_.index, question.index), inArray(questions_.id, quiz.questionIDs))),
      db.delete(questions_).where(eq(questions_.id, questionID)),
    ]);
  },

  async addanswer({ request }: RequestEvent) {
    const { questionID } = zfd
      .formData({ questionID: zfd.numeric() })
      .parse(await request.formData());

    const answer = await db.insert(answers_).values({}).returning();
    await db
      .update(questions_)
      .set({ answerIDs: sql`array_append(${questions_.answerIDs}, ${answer[0].id})` })
      .where(eq(questions_.id, questionID));
  },

  async delanswer({ request }: RequestEvent) {
    const { answerID } = zfd.formData({ answerID: zfd.numeric() }).parse(await request.formData());

    await Promise.all([
      db
        .update(questions_)
        .set({ answerIDs: sql`array_remove(${questions_.answerIDs}, ${answerID})` }),
      db.delete(answers_).where(eq(answers_.id, answerID)),
    ]);
  },

  async coranswer({ request }: RequestEvent) {
    const { questionID, answerID: correctID } = zfd
      .formData({ questionID: zfd.numeric(), answerID: zfd.numeric() })
      .parse(await request.formData());

    await db.update(questions_).set({ correctID }).where(eq(questions_.id, questionID));
  },

  async changequizname({ request }: RequestEvent) {
    const { quizCode, title } = zfd
      .formData({ quizCode: zfd.text(), title: zfd.text() })
      .parse(await request.formData());

    await db.update(quizzes_).set({ title }).where(eq(quizzes_.code, quizCode));
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

    const quiz = (await db.query.quizzes_.findFirst({ where: eq(quizzes_.code, quizCode) }))!;
    if (quiz.status >= 0) {
      await db.update(quizzes_).set({ status: -1 }).where(eq(quizzes_.code, quizCode));
      return;
    }

    const questions = (await db.query.questions_.findMany({
      where: inArray(questions_.id, quiz.questionIDs),
    }))!;
    if (questions.some((q) => !q.correctID))
      return { error: "choose correct answers for each question!" };

    await db.update(quizzes_).set({ status: 0 }).where(eq(quizzes_.code, quizCode));
    redirect(303, `/${quiz.code}`);
  },
};
