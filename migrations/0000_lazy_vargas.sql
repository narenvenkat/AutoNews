CREATE TABLE "articles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" varchar NOT NULL,
	"source" text NOT NULL,
	"url" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"content_hash" text NOT NULL,
	"media_url" text,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audio_files" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" varchar NOT NULL,
	"url" text NOT NULL,
	"duration" integer NOT NULL,
	"sample_rate" integer NOT NULL,
	"format" text DEFAULT 'wav' NOT NULL,
	"size" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic" text NOT NULL,
	"language" text DEFAULT 'en' NOT NULL,
	"target_length" integer DEFAULT 90 NOT NULL,
	"auto_publish" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"steps" jsonb DEFAULT '[]'::jsonb,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "publications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" varchar NOT NULL,
	"platform" text NOT NULL,
	"video_id" text NOT NULL,
	"status" text NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "summaries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" varchar NOT NULL,
	"text" text NOT NULL,
	"word_count" integer NOT NULL,
	"language" text NOT NULL,
	"quality_flags" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" varchar NOT NULL,
	"url_mp4" text NOT NULL,
	"url_srt" text,
	"url_thumb" text,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"duration" integer NOT NULL,
	"size" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audio_files" ADD CONSTRAINT "audio_files_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publications" ADD CONSTRAINT "publications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "summaries" ADD CONSTRAINT "summaries_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;