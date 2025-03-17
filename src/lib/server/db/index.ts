import * as schema from "./schema";

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) throw new Error("DATABASE_URL is not set");

const client = postgres(DB_URL);
export const db = drizzle({ client, schema });

export type User = typeof schema.users_.$inferSelect;
export type Quiz = typeof schema.quizzes_.$inferSelect;
export type Question = typeof schema.questions_.$inferSelect;
export type Answer = typeof schema.answers_.$inferSelect;
