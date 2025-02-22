import { db } from "$lib/server";
import { error, redirect, type ServerLoadEvent } from "@sveltejs/kit";

export async function load({ parent, params: { quizCode }, cookies }: ServerLoadEvent) {
  if (!quizCode) redirect(303, "/");

  const quiz = await db.query.quizzes_.findFirst({
    where: ({ code }, { eq }) => eq(code, quizCode),
  });
  if (!quiz) error(404, "quiz not found");

  if (quiz.status === -1) error(403, "quiz is currently not live");

  const { admin } = await parent();

  if (!admin && !cookies.get("user")) redirect(303, `/register?redirect=${quizCode}`);

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
