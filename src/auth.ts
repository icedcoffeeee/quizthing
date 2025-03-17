import "dotenv/config";
import { issuer } from "@openauthjs/openauth";
import { createSubjects } from "@openauthjs/openauth/subject";
import { MemoryStorage } from "@openauthjs/openauth/storage/memory";
import { PasswordProvider } from "@openauthjs/openauth/provider/password";
import { PasswordUI } from "@openauthjs/openauth/ui/password";
import { z } from "zod";

import colors from "tailwindcss/colors";
import { db, users_ } from "$lib/server";
import { eq } from "drizzle-orm";

export const subjects = createSubjects({
  user: z.object({
    id: z.number(),
    email: z.string(),
    username: z.string(),
  }),
});

export default issuer({
  subjects,
  storage: MemoryStorage({ persist: "./auth-data.json" }),
  providers: {
    password: PasswordProvider(
      PasswordUI({
        async sendCode(email, code) {
          console.log(email, code);
        },
      }),
    ),
  },
  theme: {
    primary: colors.slate[500],
    background: colors.slate[900],
    radius: "md",
    font: { family: "'Geist Mono'" },
    favicon: "/static/favicon.png",
    title: "QuizThing",
    css: `
/* geist-mono-latin-wght-normal */
@font-face {
  font-family: 'Geist Mono';
  font-style: normal;
  font-display: swap;
  font-weight: 100 900;
  src: url(https://cdn.jsdelivr.net/fontsource/fonts/geist-mono:vf@latest/latin-wght-normal.woff2) format('woff2-variations');
  unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
}
    `,
  },
  async success(ctx, value) {
    const { provider, email } = value;
    if (provider === "password") {
      const username = email.split("@")[0];
      const insert = db
        .insert(users_)
        .values({ email, username })
        .returning()
        .then((u) => u[0]);
      const { id } = await db.query.users_
        .findFirst({ where: eq(users_.email, email) })
        .then(async (u) => u ?? (await insert));

      return ctx.subject("user", { id, email, username });
    }
    throw new Error("Invalid provider");
  },
});
