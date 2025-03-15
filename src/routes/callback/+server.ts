import type { RequestEvent } from "./$types";
import { json, redirect } from "@sveltejs/kit";
import { client, setTokens } from "$lib/server/auth";

export async function GET({ url, cookies }: RequestEvent) {
  const code = url.searchParams.get("code");

  const exchanged = await client.exchange(code!, `${url.origin}/api/callback`);

  if (exchanged.err) return json(exchanged.err, { status: 400 });

  await setTokens(cookies, exchanged.tokens.access, exchanged.tokens.refresh);

  return redirect(302, `${url.origin}/`);
}
