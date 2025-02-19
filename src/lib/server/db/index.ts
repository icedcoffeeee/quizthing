import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

import { env } from "$env/dynamic/private";
if (!env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

const client = new Database(env.DATABASE_URL);
export const db = drizzle({ client, schema });

export type Participants = typeof schema.participants.$inferInsert;
export type Quizzes = typeof schema.quizzes.$inferInsert;
export type Questions = typeof schema.questions.$inferInsert;
export type Answers = typeof schema.answers.$inferInsert;
