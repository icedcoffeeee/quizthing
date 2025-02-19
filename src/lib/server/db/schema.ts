import { int, json, mysqlTable, serial, text, timestamp } from "drizzle-orm/mysql-core";

export const participants = mysqlTable("participants", {
  id: serial("id").primaryKey(),
  created: timestamp("created").notNull().defaultNow(),
  name: text("name").notNull(),
});

export const quizzes = mysqlTable("quizzes", {
  id: serial("id").primaryKey(),
  created: timestamp("created").notNull().defaultNow(),
  name: text("name").notNull().default("new quiz"),
  code: text("code").notNull(),
  // vv off = -1, waiting = 0, > 0 = question #
  status: int("status").notNull().default(-1),
  participantIDs: json("participantIDs").$type<number[]>().notNull().default([]),
});

export const questions = mysqlTable("questions", {
  id: serial("id").primaryKey(),
  created: timestamp("created").notNull().defaultNow(),
  title: text("title").notNull().default("new question"),
  answerIDs: json("answerIDs").$type<number[]>().notNull().default([]),
  correctID: int("correctID"),
  media: text("media"),
});

export const answers = mysqlTable("answers", {
  id: serial("id").primaryKey(),
  created: timestamp("created").notNull().defaultNow(),
  title: text("title").notNull().default("new answer"),
  // vv participants choosing this answer
  participantIDs: json("participantIDs").$type<number[]>().notNull().default([]),
});
