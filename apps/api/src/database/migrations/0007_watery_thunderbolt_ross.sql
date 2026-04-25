ALTER TABLE "projects" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
CREATE INDEX "projects_client_id_idx" ON "projects" USING btree ("client_id");