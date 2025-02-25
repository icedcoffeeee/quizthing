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
  quiz: Quiz & { users_bridge: { to_user: User & { answers_bridge: { to_answer: Answer }[] } }[] },
  userID?: number,
) {
  return quiz.users_bridge
    .map((b) => b.to_user)
    .find((u) => u.id === userID)
    ?.answers_bridge.map((b) => b.to_answer);
}

export function getfractionalcsswidth<T extends { users_bridge: any[] }>(
  answer: Answer & T,
  quiz: Quiz & T & any,
) {
  return 100 * (answer.users_bridge.length / Math.max(quiz.users_bridge.length, 1));
}

export function getusersscores(
  user: User & { answers_bridge: { to_answer: Answer }[] },
  questions: Question[],
  shown: boolean,
  index: number,
) {
  return (
    user.answers_bridge
      .map((b) => b.to_answer.id)
      .filter((a, i) => a === questions[i].correctID && i < (shown ? index + 1 : index)).length ?? 0
  );
}
