import type { Actions } from "./$types";
import { answers_, db, quizzes_ } from "$lib/server";
import { eq, sql } from "drizzle-orm";
import { error, redirect, type ServerLoadEvent } from "@sveltejs/kit";
import { zfd } from "zod-form-data";

export async function load({ parent, params: { quizCode } }: ServerLoadEvent) {
  if (!quizCode) redirect(303, "/");

  const quiz = await db.query.quizzes_.findFirst({
    where: ({ code }, { eq }) => eq(code, quizCode),
  });
  if (!quiz) error(404, "quiz not found");

  if (quiz.status === -1) error(403, "quiz is currently not live");

  const { admin, userID } = await parent();

  if (!admin && !userID) redirect(303, `/register?redirect=${quizCode}`);

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
  const userAnswers = userID
    ? answers
        .map((as) => as.find((a) => a.participantIDs.includes(parseInt(userID))))
        .map((a) => a?.id)
    : undefined;

  return { quiz, questions, answers, userAnswers };
}

export const actions: Actions = {
  async stop({ request }) {
    const { quizCode } = zfd.formData({ quizCode: zfd.text() }).parse(await request.formData());
    await db.update(quizzes_).set({ status: -1 }).where(eq(quizzes_.code, quizCode));
    redirect(303, `/admin/${quizCode}`);
  },
  async pause({ request }) {
    const { quizCode } = zfd.formData({ quizCode: zfd.text() }).parse(await request.formData());
    await db.update(quizzes_).set({ status: 0 }).where(eq(quizzes_.code, quizCode));
  },
  async question({ request }) {
    const { quizCode, questionIND } = zfd
      .formData({ quizCode: zfd.text(), questionIND: zfd.numeric() })
      .parse(await request.formData());
    const quiz = (await db.query.quizzes_.findFirst({
      where: ({ code }, { eq }) => eq(code, quizCode),
    }))!;
    const status = quiz.status == questionIND ? quiz.status + 0.5 : questionIND;
    console.log(status);
    await db.update(quizzes_).set({ status }).where(eq(quizzes_.code, quizCode));
  },
  async answer({ request }) {
    const { chosenAnswerID, userID } = zfd
      .formData({ chosenAnswerID: zfd.numeric(), userID: zfd.numeric() })
      .parse(await request.formData());
    await db
      .update(answers_)
      .set({
        participantIDs: sql`JSON_ARRAY_INSERT(${answers_.participantIDs}, '$[0]', ${userID})`,
      })
      .where(eq(answers_.id, chosenAnswerID));
  },
};
