import type { Actions, PageServerLoadEvent } from "./$types";
import { answers_, db, participants_, quizzes_ } from "$lib/server";
import { and, eq, inArray, sql } from "drizzle-orm";
import { error, redirect } from "@sveltejs/kit";
import { zfd } from "zod-form-data";

export async function load({ parent, params: { quizCode } }: PageServerLoadEvent) {
  if (!quizCode) redirect(303, "/");

  const quiz = await db.query.quizzes_.findFirst({
    where: ({ code }, { eq }) => eq(code, quizCode),
  });
  if (!quiz) error(404, "quiz not found");

  if (quiz.status === -1) error(403, "quiz is currently not live");

  const { admin, userID } = await parent();

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

  let userAnswers;
  if (!admin) {
    if (!userID) {
      const url = new URL("/register");
      url.searchParams.append("redirect", quizCode);
      redirect(303, url);
    }
    if (!quiz.participantIDs.includes(parseInt(userID)))
      await db
        .update(quizzes_)
        .set({
          participantIDs: sql`JSON_ARRAY_INSERT(${quizzes_.participantIDs}, '$[0]', CAST(${userID} AS JSON))`,
        })
        .where(and(eq(quizzes_.code, quizCode)));
    userAnswers = answers
      .map((as) => as.find((a) => a.participantIDs.includes(parseInt(userID))))
      .map((a) => a?.id);
  }

  const participants = await db.query.participants_.findMany({
    where: ({ id }, { inArray }) => inArray(id, quiz.participantIDs),
    orderBy: ({ correct }, { desc }) => desc(correct),
  });

  return { quiz, questions, answers, participants, userAnswers };
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
    const status = quiz.status === questionIND ? quiz.status + 0.5 : questionIND;
    if (quiz.status === questionIND) {
      const question = (await db.query.questions_.findFirst({
        where: ({ quizID }, { eq }) => eq(quizID, quiz.id),
      }))!;
      const answer = (await db.query.answers_.findFirst({
        where: ({ id, questionID }, { and, eq }) =>
          and(eq(questionID, question.id), eq(id, question.correctID!)),
      }))!;
      await db
        .update(participants_)
        .set({ correct: sql`${participants_.correct} + 1` })
        .where(inArray(participants_.id, answer.participantIDs));
    }
    await db.update(quizzes_).set({ status }).where(eq(quizzes_.code, quizCode));
  },
  async answer({ request }) {
    const { chosenAnswerID, correctID, userID } = zfd
      .formData({ chosenAnswerID: zfd.numeric(), correctID: zfd.numeric(), userID: zfd.numeric() })
      .parse(await request.formData());
    await db
      .update(answers_)
      .set({
        participantIDs: sql`JSON_ARRAY_INSERT(${answers_.participantIDs}, '$[0]', ${userID})`,
      })
      .where(eq(answers_.id, chosenAnswerID));
    console.log(chosenAnswerID, correctID, userID);
  },
};
