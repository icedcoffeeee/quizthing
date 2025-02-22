import { drizzle } from "drizzle-orm/mysql2";
import mysql2 from "mysql2/promise";
import * as schema from "./schema";

import { env } from "$env/dynamic/private";
if (!env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

const client = await mysql2.createConnection(env.DATABASE_URL);
export const db = drizzle({ client, schema, mode: "default" });

export type Participants = typeof schema.participants_.$inferInsert;
export type Quizzes = typeof schema.quizzes_.$inferInsert;
export type Questions = typeof schema.questions_.$inferInsert;
export type Answers = typeof schema.answers_.$inferInsert;
