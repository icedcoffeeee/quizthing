import { db, quizzes_ } from "$lib/server";
import { error, redirect, type ServerLoadEvent } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { zfd } from "zod-form-data";
import { eq } from "drizzle-orm";

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
    await db.update(quizzes_).set({ status }).where(eq(quizzes_.code, quizCode));
  },
};
