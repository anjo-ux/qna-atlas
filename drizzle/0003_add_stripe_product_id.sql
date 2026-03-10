-- Add Stripe product id to subscription_plans (links to Stripe Dashboard products)
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "stripe_product_id" varchar;
