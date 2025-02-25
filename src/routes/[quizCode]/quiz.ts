import type { Answer, Question, Quiz, User } from "$lib/server";

export function getanswersandindex<T extends Answer & { users_bridge: any[] }>(
  questions: (Question & { answers: T[] })[],
): [T, number][][] {
  return questions.map((q) => q.answers.map((a, i) => [a, i]));
}

export function getsortedanswersandindex<T extends Answer & { users_bridge: any[] }>(
  answers: [T, number][][],
  ind: number,
) {
  return answers[ind].sort((a, b) => b[0].users_bridge.length - a[0].users_bridge.length);
}

export function getuseranswers(
  quiz: Quiz & {
    questions: (Question & { answers: Answer[] })[];
    users_bridge: { to_user: User & { answers_bridge: { to_answer: Answer }[] } }[];
  },
  userID?: number,
) {
  const user_answers = quiz.users_bridge
    .map((b) => b.to_user)
    .find((u) => u.id === userID)
    ?.answers_bridge.map((b) => b.to_answer);
  const quiz_answerIDs = quiz.questions.flatMap((q) => q.answers).map((a) => a.id);
  return user_answers?.filter((a) => quiz_answerIDs.includes(a.id));
}

export function getfractionalcsswidth<T extends { users_bridge: any[] }>(
  answer: Answer & T,
  quiz: Quiz & T & any,
) {
  return 100 * (answer.users_bridge.length / Math.max(quiz.users_bridge.length, 1));
}

export function getusersscores(
  user: User & { answers_bridge: { to_answer: Answer }[] },
  questions: (Question & { answers: Answer[] })[],
  shown: boolean,
  index: number,
) {
  const u_answers = user.answers_bridge.map((b) => b.to_answer);
  const scores = u_answers
    .filter(
      (a) =>
        questions?.map((q) => q.id).includes(a.questionID) &&
        questions?.map((q) => q.correctID).includes(a.id),
    )
    .filter((_, i) => i < (shown ? index + 1 : index));
  return scores.length;
}
