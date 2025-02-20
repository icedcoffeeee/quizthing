export function getQuizStatus(status: number) {
  switch (status) {
    case -1:
      return "off";
    case 0:
      return "waiting";
    default:
      return `on question ${status}`;
  }
}
