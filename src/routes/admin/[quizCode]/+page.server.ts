import { answers, db, questions } from "$lib/server";
import { error, redirect, type Actions, type ServerLoadEvent } from "@sveltejs/kit";
import { zfd } from "zod-form-data";

export async function load({ params: { quizCode } }: ServerLoadEvent) {
  if (!quizCode) redirect(303, "/admin");

  const quiz = await db.query.quizzes.findFirst({
    where: ({ code }, { eq }) => eq(code, quizCode),
  });
  if (!quiz) error(404, "quiz not found");

  const questions_ = await db.query.questions.findMany({
    where: ({ quizID }, { eq }) => eq(quizID, quiz.id),
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

    await db.insert(questions).values({ quizID: quiz.id });
  },

  async addanswer({ request }) {
    const schema = zfd.formData({ questionID: zfd.numeric() });
    const { questionID } = schema.parse(await request.formData());

    const question = (await db.query.questions.findFirst({
      where: ({ id }, { eq }) => eq(id, questionID),
    }))!;

    await db.insert(answers).values({ questionID: question.id }).$returningId();
  },
};
