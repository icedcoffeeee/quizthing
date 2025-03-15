import { issuer } from "@openauthjs/openauth";
import { createSubjects } from "@openauthjs/openauth/subject";
import { MemoryStorage } from "@openauthjs/openauth/storage/memory";
import { PasswordProvider } from "@openauthjs/openauth/provider/password";
import { PasswordUI } from "@openauthjs/openauth/ui/password";
import { z } from "zod";
import { db, users_ } from "$lib/server";

export const subjects = createSubjects({
  user: z.object({
    id: z.number(),
    username: z.string(),
  }),
});

export default issuer({
  subjects,
  storage: MemoryStorage({ persist: "./auth-data.json" }),
  providers: {
    password: PasswordProvider(
      PasswordUI({
        copy: { input_email: "username" },
        async sendCode(username, code) {
          console.log(username, code);
        },
      }),
    ),
  },
  async success(ctx, value) {
    const { provider, email: username } = value;
    if (provider === "password") {
      const data = await db.insert(users_).values({ username }).returning();
      return ctx.subject("user", { id: data[0].id, username });
    }
    throw new Error("Invalid provider");
  },
});
