import { type Handle } from "@sveltejs/kit";
import { client, setTokens } from "$lib/server/auth";
import { subjects } from "./auth";

export const handle: Handle = async ({ event, resolve }) => {
  const access = event.cookies.get("access_token");
  const refresh = event.cookies.get("refresh_token");

  if (access) {
    const verified = await client.verify(subjects, access, { refresh });
    if (verified.err) return new Response(verified.err.message);
    if (verified.tokens) setTokens(event.cookies, verified.tokens.access, verified.tokens.refresh);
    event.locals.user = verified.subject.properties;
  }
  return resolve(event);
};
