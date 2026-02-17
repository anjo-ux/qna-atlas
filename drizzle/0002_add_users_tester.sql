-- Add tester column to users (beta access to Question Authentication Platform); null = false
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tester" boolean;
