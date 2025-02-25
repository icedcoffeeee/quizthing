import type { Actions, PageServerLoadEvent, RequestEvent } from "./$types";
import { asc, eq, inArray, sql } from "drizzle-orm";
import { error, redirect } from "@sveltejs/kit";
import { zfd } from "zod-form-data";
import { answers_, db, questions_, quizzes_, users_ } from "$lib/server";

export async function load({ parent, params: { quizCode } }: PageServerLoadEvent) {
  let quiz = (await db.query.quizzes_.findFirst({ where: eq(quizzes_.code, quizCode) }))!;
  const questions = await db.query.questions_.findMany({
    where: inArray(questions_.id, quiz.questionIDs),
    orderBy: asc(questions_.index),
  });
  const answers = await Promise.all(
    questions.map((q) =>
      db.query.answers_.findMany({
        where: inArray(answers_.id, q.answerIDs),
      }),
    ),
  );

  if (!quiz) error(404, "quiz not found");
  if (quiz.status === -1) error(403, "quiz is currently not live");

  const { admin, userID } = await parent();
  if (!admin) {
    if (!userID) {
      redirect(303, `/register?redirect=${quizCode}`);
    }
    if (!quiz.userIDs.includes(userID)) {
      await db
        .update(quizzes_)
        .set({ userIDs: sql`array_append(${quizzes_.userIDs}, ${userID})` })
        .where(eq(quizzes_.code, quizCode));
      quiz.userIDs.push(userID);
    }
  }

  const users = await db.query.users_.findMany({ where: inArray(users_.id, quiz.userIDs) });

  return { quiz, questions, answers, users };
}

async function setstatus(request: Request, status: number) {
  const { quizCode } = zfd.formData({ quizCode: zfd.text() }).parse(await request.formData());

  await db.update(quizzes_).set({ status }).where(eq(quizzes_.code, quizCode));

  if (status === -1) redirect(303, "/admin/" + quizCode);
}

export const actions: Actions = {
  stop: ({ request }) => setstatus(request, -1),
  pause: ({ request }) => setstatus(request, 0),

  async question({ request }: RequestEvent) {
    const { quizCode, index, status } = zfd
      .formData({ quizCode: zfd.text(), index: zfd.numeric(), status: zfd.numeric() })
      .parse(await request.formData());
    await db
      .update(quizzes_)
      .set({ status: index === status ? sql`${quizzes_.status} + 0.5` : index })
      .where(eq(quizzes_.code, quizCode));
  },

  async answer({ request }: RequestEvent) {
    const { userID, answerID } = zfd
      .formData({ userID: zfd.numeric(), answerID: zfd.numeric() })
      .parse(await request.formData());

    // link answer to user
    await db
      .update(answers_)
      .set({ userIDs: sql`array_append(${answers_.userIDs}, ${userID})` })
      .where(eq(answers_.id, answerID));
  },
};
