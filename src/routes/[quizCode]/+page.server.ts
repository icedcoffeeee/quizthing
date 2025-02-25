import type { Actions, PageServerLoadEvent, RequestEvent } from "./$types";
import { db, questions_, quizzes_, users_answers, users_quizzes } from "$lib/server";
import { asc, eq, sql } from "drizzle-orm";
import { error, redirect } from "@sveltejs/kit";
import { zfd } from "zod-form-data";

export async function load({ parent, params: { quizCode } }: PageServerLoadEvent) {
  // prettier-ignore
  const fetchQuiz = db.query.quizzes_.findFirst({
    where: eq(quizzes_.code, quizCode),
    with: {
      questions: {
        orderBy: asc(questions_.index),
        with: { answers: { with: { users_bridge: {
          columns: {},
          with: { to_answer: true },
        }}}},
      },
      users_bridge: {
        columns: {},
        with: { to_user: { with: { answers_bridge: {
          columns: {},
          with: { to_answer: true },
        }}}},
      },
    },
  });

  let quiz = (await fetchQuiz)!;

  if (!quiz) error(404, "quiz not found");
  if (quiz.status === -1) error(403, "quiz is currently not live");

  const { admin, userID } = await parent();
  if (!admin) {
    if (!userID) {
      redirect(303, `/register?redirect=${quizCode}`);
    }
    if (!quiz.users_bridge.map((b) => b.to_user.id).includes(userID)) {
      await db.insert(users_quizzes).values({ userID, quizCode });
      quiz = (await fetchQuiz)!;
    }
  }

  return { quiz };
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
    await db.insert(users_answers).values({ userID, answerID });
  },
};
