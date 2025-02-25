import * as schema from "./schema";

import { env } from "$env/dynamic/private";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
if (!env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

const client = postgres(env.DATABASE_URL);
export const db = drizzle({ client, schema });

export type User = typeof schema.users_.$inferSelect;
export type Quiz = typeof schema.quizzes_.$inferSelect;
export type Question = typeof schema.questions_.$inferSelect;
export type Answer = typeof schema.answers_.$inferSelect;
