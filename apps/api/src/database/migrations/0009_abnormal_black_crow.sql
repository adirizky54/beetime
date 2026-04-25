CREATE TYPE "public"."interval_format_enum" AS ENUM('hours-minutes', 'hours-minutes-colon-separated', 'hours-minutes-seconds-colon-separated');--> statement-breakpoint
CREATE TYPE "public"."time_format_enum" AS ENUM('12-hours', '24-hours');--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "time_format" time_format_enum DEFAULT '24-hours';