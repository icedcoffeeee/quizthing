import type { CookieSerializeOptions } from "cookie";
import type { Cookies } from "@sveltejs/kit";
import { createClient } from "@openauthjs/openauth/client";

export const client = createClient({
  clientID: "nextjs",
  issuer: "http://localhost:3001",
});

export async function setTokens(cookies: Cookies, access: string, refresh: string) {
  const opts: CookieSerializeOptions & { path: string } = {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 34560000,
  };
  cookies.set("access_token", access, opts);
  cookies.set("refresh_token", refresh, opts);
}
