import { integer, pgTable, real, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const quizzes_ = pgTable("quizzes", {
  code: varchar("code").primaryKey(),
  created: timestamp("created").notNull().defaultNow(),
  title: text("title").notNull().default("new quiz"),
  status: real("status").notNull().default(-1),
  questionIDs: integer("questionIDs")
    .references(() => questions_.id)
    .array()
    .notNull()
    .default([]),
  userIDs: integer("userIDs")
    .references(() => users_.id)
    .array()
    .notNull()
    .default([]),
});

export const questions_ = pgTable("questions", {
  id: serial("id").primaryKey(),
  created: timestamp("created").notNull().defaultNow(),
  title: text("title").notNull().default("new question"),
  index: integer("index").notNull(),
  answerIDs: integer("answerIDs")
    .references(() => answers_.id)
    .array()
    .notNull()
    .default([]),
  correctID: integer("correctID"),
  media: text("media"),
});

export const answers_ = pgTable("answers", {
  id: serial("id").primaryKey(),
  created: timestamp("created").notNull().defaultNow(),
  title: text("title").notNull().default("new answer"),
  userIDs: integer("userIDs")
    .references(() => users_.id)
    .array()
    .notNull()
    .default([]),
});

export const users_ = pgTable("users", {
  id: serial("id").primaryKey(),
  created: timestamp("created").notNull().defaultNow(),
  email: varchar("email").notNull(),
  username: varchar("username").notNull(),
});
