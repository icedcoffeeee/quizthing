import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  primaryKey,
  real,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// schemas
export const quizzes_ = pgTable("quizzes", {
  code: varchar("code").primaryKey(),
  created: timestamp("created").notNull().defaultNow(),
  name: text("name").notNull().default("new quiz"),
  status: real("status").notNull().default(-1),
});
export const questions_ = pgTable("questions", {
  id: serial("id").primaryKey(),
  created: timestamp("created").notNull().defaultNow(),
  title: text("title").notNull().default("new question"),
  index: integer("index").notNull(),
  quizCode: varchar("quizCode")
    .notNull()
    .references(() => quizzes_.code, { onDelete: "cascade" }),
  correctID: integer("correctID"),
  media: text("media"),
});
export const answers_ = pgTable("answers", {
  id: serial("id").primaryKey(),
  created: timestamp("created").notNull().defaultNow(),
  title: text("title").notNull().default("new answer"),
  questionID: integer("questionID")
    .notNull()
    .references(() => questions_.id, { onDelete: "cascade" }),
});
export const users_ = pgTable("users", {
  id: serial("id").primaryKey(),
  created: timestamp("created").notNull().defaultNow(),
  name: varchar("name").notNull(),
});

// many-to-many
export const users_quizzes = pgTable(
  "users_quizzes",
  {
    userID: integer("userID")
      .notNull()
      .references(() => users_.id, { onDelete: "cascade" }),
    quizCode: varchar("quizCode")
      .notNull()
      .references(() => quizzes_.code, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.userID, table.quizCode] })],
);
export const users_answers = pgTable(
  "users_answers",
  {
    userID: integer("userID")
      .notNull()
      .references(() => users_.id, { onDelete: "cascade" }),
    answerID: integer("answerID")
      .notNull()
      .references(() => answers_.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.userID, table.answerID] })],
);

// relations
export const quizRelations = relations(quizzes_, ({ many }) => ({
  questions: many(questions_),
  users_bridge: many(users_quizzes),
}));
export const questionsRelations = relations(questions_, ({ one, many }) => ({
  answers: many(answers_),
  quiz: one(quizzes_, { fields: [questions_.quizCode], references: [quizzes_.code] }),
}));
export const answersRelations = relations(answers_, ({ one, many }) => ({
  questions: one(questions_, { fields: [answers_.questionID], references: [questions_.id] }),
  users_bridge: many(users_answers),
}));
export const usersRelations = relations(users_, ({ many }) => ({
  answers_bridge: many(users_answers),
  quizzes_bridge: many(users_quizzes),
}));

export const usersQuizzesRelations = relations(users_quizzes, ({ one }) => ({
  to_user: one(users_, { fields: [users_quizzes.userID], references: [users_.id] }),
  to_quiz: one(quizzes_, { fields: [users_quizzes.quizCode], references: [quizzes_.code] }),
}));
export const usersAnswersRelations = relations(users_answers, ({ one }) => ({
  to_user: one(users_, { fields: [users_answers.userID], references: [users_.id] }),
  to_answer: one(answers_, { fields: [users_answers.answerID], references: [answers_.id] }),
}));
