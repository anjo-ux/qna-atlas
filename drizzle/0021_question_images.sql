ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "image_url" varchar(512);
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "image_alt" varchar(256);
