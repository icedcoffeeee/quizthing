import type { CookieSerializeOptions } from "cookie";
import type { Cookies } from "@sveltejs/kit";
import { createClient } from "@openauthjs/openauth/client";

export const client = createClient({
  clientID: "sveltekit",
  issuer: "http://localhost:3001",
});

const auth_cookie_opts: CookieSerializeOptions & { path: string } = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  maxAge: 34560000,
};

export function setTokens(cookies: Cookies, access: string, refresh: string) {
  cookies.set("access_token", access, auth_cookie_opts);
  cookies.set("refresh_token", refresh, auth_cookie_opts);
}

export function removeTokens(cookies: Cookies) {
  cookies.delete("access_token", auth_cookie_opts);
  cookies.delete("refresh_token", auth_cookie_opts);
}
