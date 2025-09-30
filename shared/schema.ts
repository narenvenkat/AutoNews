import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topic: text("topic").notNull(),
  language: text("language").notNull().default("en"),
  targetLength: integer("target_length").notNull().default(90),
  autoPublish: boolean("auto_publish").notNull().default(false),
  status: text("status").notNull().default("queued"), // queued, running, completed, failed
  progress: integer("progress").notNull().default(0), // 0-100
  steps: jsonb("steps").default([]), // array of completed steps
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const articles = pgTable("articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  source: text("source").notNull(), // "gnews"
  url: text("url").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  contentHash: text("content_hash").notNull(),
  mediaUrl: text("media_url"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const summaries = pgTable("summaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  wordCount: integer("word_count").notNull(),
  language: text("language").notNull(),
  qualityFlags: jsonb("quality_flags").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const audioFiles = pgTable("audio_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  duration: integer("duration").notNull(), // seconds
  sampleRate: integer("sample_rate").notNull(),
  format: text("format").notNull().default("wav"),
  size: integer("size"), // bytes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const videos = pgTable("videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  urlMp4: text("url_mp4").notNull(),
  urlSrt: text("url_srt"),
  urlThumb: text("url_thumb"),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  duration: integer("duration").notNull(), // seconds
  size: integer("size"), // bytes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const publications = pgTable("publications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(), // "youtube"
  videoId: text("video_id").notNull(), // platform-specific ID
  status: text("status").notNull(), // "uploaded", "processing", "published", "failed"
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const jobsRelations = relations(jobs, ({ one, many }) => ({
  article: one(articles),
  summary: one(summaries),
  audio: one(audioFiles),
  video: one(videos),
  publications: many(publications),
}));

export const articlesRelations = relations(articles, ({ one }) => ({
  job: one(jobs, { fields: [articles.jobId], references: [jobs.id] }),
}));

export const summariesRelations = relations(summaries, ({ one }) => ({
  job: one(jobs, { fields: [summaries.jobId], references: [jobs.id] }),
}));

export const audioFilesRelations = relations(audioFiles, ({ one }) => ({
  job: one(jobs, { fields: [audioFiles.jobId], references: [jobs.id] }),
}));

export const videosRelations = relations(videos, ({ one }) => ({
  job: one(jobs, { fields: [videos.jobId], references: [jobs.id] }),
}));

export const publicationsRelations = relations(publications, ({ one }) => ({
  job: one(jobs, { fields: [publications.jobId], references: [jobs.id] }),
}));

// Schemas
export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
});

export const insertSummarySchema = createInsertSchema(summaries).omit({
  id: true,
  createdAt: true,
});

export const insertAudioSchema = createInsertSchema(audioFiles).omit({
  id: true,
  createdAt: true,
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  createdAt: true,
});

export const insertPublicationSchema = createInsertSchema(publications).omit({
  id: true,
  createdAt: true,
  publishedAt: true,
});

// Types
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Summary = typeof summaries.$inferSelect;
export type InsertSummary = z.infer<typeof insertSummarySchema>;
export type AudioFile = typeof audioFiles.$inferSelect;
export type InsertAudioFile = z.infer<typeof insertAudioSchema>;
export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Publication = typeof publications.$inferSelect;
export type InsertPublication = z.infer<typeof insertPublicationSchema>;

// User schema (keeping existing)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
