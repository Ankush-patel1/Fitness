import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  password: text("password").notNull(),
  fitnessGoals: text("fitness_goals").array().default(sql`ARRAY[]::text[]`),
  currentWeight: real("current_weight"),
  targetWeight: real("target_weight"),
  workoutFrequency: integer("workout_frequency"),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workouts = pgTable("workouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  duration: integer("duration").notNull(), // in minutes
  exercises: text("exercises").notNull(), // JSON string
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const healthMetrics = pgTable("health_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  weight: real("weight"),
  sleepHours: real("sleep_hours"),
  sleepQuality: text("sleep_quality"), // poor, fair, good, excellent
  waterIntake: integer("water_intake"), // glasses
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const scheduledWorkouts = pgTable("scheduled_workouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  duration: integer("duration").notNull(),
  completed: integer("completed").default(0), // 0 = false, 1 = true
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  currentStreak: true,
  longestStreak: true,
  createdAt: true,
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
  createdAt: true,
});

export const insertHealthMetricsSchema = createInsertSchema(healthMetrics).omit({
  id: true,
  createdAt: true,
});

export const insertScheduledWorkoutSchema = createInsertSchema(scheduledWorkouts).omit({
  id: true,
  completed: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type Workout = typeof workouts.$inferSelect;
export type InsertHealthMetrics = z.infer<typeof insertHealthMetricsSchema>;
export type HealthMetrics = typeof healthMetrics.$inferSelect;
export type InsertScheduledWorkout = z.infer<typeof insertScheduledWorkoutSchema>;
export type ScheduledWorkout = typeof scheduledWorkouts.$inferSelect;
