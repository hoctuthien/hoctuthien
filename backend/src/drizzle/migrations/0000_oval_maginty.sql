-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."course_bookings_status_enum" AS ENUM('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled');--> statement-breakpoint
CREATE TYPE "public"."courses_status_enum" AS ENUM('DRAFT', 'PENDING', 'ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TYPE "public"."mentor_availabilities_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."payments_status_enum" AS ENUM('pending', 'success', 'failed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."users_role_enum" AS ENUM('mentee', 'mentor', 'admin');--> statement-breakpoint
CREATE TABLE "redis" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"userId" varchar NOT NULL,
	"userAgent" varchar NOT NULL,
	"ipAddress" varchar NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"isRevoked" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"google_id" varchar(255),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255),
	"phone" varchar(50),
	"avatar_url" varchar(500),
	"day_of_birth" date,
	"gender" varchar(50),
	"timezone" varchar(50) DEFAULT 'UTC',
	"role" "users_role_enum" DEFAULT 'mentee' NOT NULL,
	"points" integer DEFAULT 0,
	"is_verified" boolean DEFAULT false,
	"preferences" jsonb DEFAULT '{}'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"status" varchar(50) DEFAULT 'active',
	CONSTRAINT "UQ_0bd5012aeb82628e07f6a1be53b" UNIQUE("google_id"),
	CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE("email"),
	CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"user_id" bigint NOT NULL,
	"refresh_token" varchar(255) NOT NULL,
	"device_name" varchar(255),
	"device_type" varchar(100),
	"user_agent" text,
	"ip_address" "inet",
	"refresh_token_expires_at" timestamp with time zone NOT NULL,
	"last_used_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mentor_profiles" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"user_id" bigint NOT NULL,
	"job_title" varchar(255),
	"company" varchar(255),
	"bio" text,
	"linkedin_url" varchar(500),
	"years_of_experience" integer,
	"skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"average_rating" numeric(3, 2) DEFAULT '0' NOT NULL,
	"total_students" integer DEFAULT 0 NOT NULL,
	"is_approved" boolean DEFAULT false NOT NULL,
	"approved_by" bigint,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	CONSTRAINT "UQ_5fa86c14c3a0de91f7253a180bb" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "mentor_availabilities" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"mentor_id" bigint NOT NULL,
	"approved_by" bigint,
	"job_title" varchar(255),
	"company" varchar(255),
	"bio" text,
	"linkedin_url" varchar(500),
	"years_of_experience" integer,
	"skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" "mentor_availabilities_status_enum" DEFAULT 'PENDING' NOT NULL,
	"note" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"mentor_id" bigint NOT NULL,
	"approved_by" bigint,
	"title" varchar(255) NOT NULL,
	"description" text,
	"thumbnail_url" varchar(500),
	"price" numeric(15, 2) NOT NULL,
	"duration_minutes" integer DEFAULT 60 NOT NULL,
	"prerequisites" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" "courses_status_enum" DEFAULT 'DRAFT' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_categories" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"course_id" bigint NOT NULL,
	"category_id" bigint NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	CONSTRAINT "UQ_0fcee24a5291cf6c3de60ea670e" UNIQUE("course_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255),
	"icon_url" varchar(500),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"user_id" bigint NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'VND' NOT NULL,
	"payment_method" varchar(100),
	"transaction_id" varchar(255),
	"description" varchar(500),
	"expired_at" timestamp with time zone,
	"vietqr_qr_data_url" text,
	"vietqr_payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"payment_gateway_payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"paid_at" timestamp with time zone,
	"status" "payments_status_enum" DEFAULT 'pending' NOT NULL,
	CONSTRAINT "UQ_3c324ca49dabde7ffc0ef64675d" UNIQUE("transaction_id")
);
--> statement-breakpoint
CREATE TABLE "course_bookings" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"course_id" bigint NOT NULL,
	"mentee_id" bigint NOT NULL,
	"meeting_time" timestamp with time zone NOT NULL,
	"google_meet_url" varchar(500),
	"calendar_event_id" varchar(255),
	"notes_for_mentor" text,
	"cancellation_reason" text,
	"payment_id" bigint,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" "course_bookings_status_enum" DEFAULT 'pending' NOT NULL,
	CONSTRAINT "REL_2bcf136d1622f9e26f660dc949" UNIQUE("payment_id")
);
--> statement-breakpoint
CREATE TABLE "course_reviews" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"course_booking_id" bigint NOT NULL,
	"course_id" bigint NOT NULL,
	"reviewer_id" bigint NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	CONSTRAINT "UQ_ae8af75a0e1b00ff26be172b577" UNIQUE("course_booking_id")
);
--> statement-breakpoint
CREATE TABLE "user_reviews" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"course_booking_id" bigint NOT NULL,
	"reviewer_id" bigint NOT NULL,
	"reviewed_id" bigint NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"type" varchar(50),
	"status" varchar(50) DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_config" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"config_key" varchar(255) NOT NULL,
	"config_value" jsonb NOT NULL,
	"description" text,
	"created_by" bigint,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	CONSTRAINT "UQ_c54d4e3d5a246ef29601e48d751" UNIQUE("config_key")
);
--> statement-breakpoint
CREATE TABLE "penalty_tickets" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"user_id" bigint NOT NULL,
	"reason" text NOT NULL,
	"points_deducted" integer DEFAULT 0 NOT NULL,
	"evidence_url" varchar(500),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"mentor_id" bigint NOT NULL,
	"mentee_id" bigint NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"conversation_id" bigint NOT NULL,
	"sender_id" bigint NOT NULL,
	"content" text NOT NULL,
	"attachments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"user_id" bigint NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"type" varchar(100) NOT NULL,
	"action_link" varchar(500),
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "FK_e9658e959c490b0a634dfc54783" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentor_profiles" ADD CONSTRAINT "FK_5fa86c14c3a0de91f7253a180bb" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentor_profiles" ADD CONSTRAINT "FK_110ee6d532ceda80f06a52827ec" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentor_availabilities" ADD CONSTRAINT "FK_97e6437a382fba7006286ade1c3" FOREIGN KEY ("mentor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentor_availabilities" ADD CONSTRAINT "FK_3ad98be5779026743d0a5183ca8" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "FK_6a6abcb4975e235ea32e6c7fd98" FOREIGN KEY ("mentor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "FK_081d019674a95831850573a51e3" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_categories" ADD CONSTRAINT "FK_c961c57e9f869094eebab0d547d" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_categories" ADD CONSTRAINT "FK_53c2e5fe2bb1ba3c21deac6a986" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "FK_427785468fb7d2733f59e7d7d39" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_bookings" ADD CONSTRAINT "FK_0fa3cabc0a327c50557f304c181" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_bookings" ADD CONSTRAINT "FK_9fa0254718aaf654707a0d6ba64" FOREIGN KEY ("mentee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_bookings" ADD CONSTRAINT "FK_2bcf136d1622f9e26f660dc9495" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_reviews" ADD CONSTRAINT "FK_ae8af75a0e1b00ff26be172b577" FOREIGN KEY ("course_booking_id") REFERENCES "public"."course_bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_reviews" ADD CONSTRAINT "FK_1f69fdcbd7ea5f0e52c3230c00b" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_reviews" ADD CONSTRAINT "FK_0e8d075087cb5408c0e9578d87e" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_reviews" ADD CONSTRAINT "FK_3ff984b7f418d5f49f4b516390b" FOREIGN KEY ("course_booking_id") REFERENCES "public"."course_bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_reviews" ADD CONSTRAINT "FK_0ba89242a8bea8c4a3780963d7d" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_reviews" ADD CONSTRAINT "FK_0e43c5f7ecb9c6c074cb4067073" FOREIGN KEY ("reviewed_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_config" ADD CONSTRAINT "FK_67098b57e7e7c5f4096581589d0" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "penalty_tickets" ADD CONSTRAINT "FK_451e10d609d7abedd0cc1be5b8b" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "FK_758daecfb58715b12dd3abbcdc7" FOREIGN KEY ("mentor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "FK_ff45964dca3e37d8430f7206502" FOREIGN KEY ("mentee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "FK_3bc55a7c3f9ed54b520bb5cfe23" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "FK_22133395bd13b970ccd0c34ab22" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
*/