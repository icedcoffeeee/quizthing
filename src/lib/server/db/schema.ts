import { float, int, json, mysqlTable, serial, text, timestamp } from "drizzle-orm/mysql-core";

export const participants_ = mysqlTable("participants", {
  id: serial("id").primaryKey(),
  created: timestamp("created").notNull().defaultNow(),
  name: text("name").notNull(),
  correct: int("correct").notNull().default(0),
});

export const quizzes_ = mysqlTable("quizzes", {
  id: serial("id").primaryKey(),
  created: timestamp("created").notNull().defaultNow(),
  name: text("name").notNull().default("new quiz"),
  code: text("code").notNull(),
  // vv off = -1, waiting = 0, > 0 = question #
  status: float("status").notNull().default(-1),
  participantIDs: json("participantIDs").$type<number[]>().notNull().default([]),
});

export const questions_ = mysqlTable("questions", {
  id: serial("id").primaryKey(),
  created: timestamp("created").notNull().defaultNow(),
  title: text("title").notNull().default("new question"),
  quizID: int("quizID").notNull(),
  index: int("index").notNull(),
  correctID: int("correctID"),
  media: text("media"),
});

export const answers_ = mysqlTable("answers", {
  id: serial("id").primaryKey(),
  created: timestamp("created").notNull().defaultNow(),
  title: text("title").notNull().default("new answer"),
  questionID: int("questionID").notNull(),
  // vv participants_ choosing this answer
  participantIDs: json("participantIDs").$type<number[]>().notNull().default([]),
});
