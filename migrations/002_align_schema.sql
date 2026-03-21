-- Migration 002: Align DB with Drizzle schema (drop simple tables, recreate properly)

-- Drop old tables in safe order (dependents first)
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS follow_ups CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS pipeline_stages CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS submission_files CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS intake_forms CASCADE;
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS memberships CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop old enums
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS membership_status CASCADE;
DROP TYPE IF EXISTS agent_type CASCADE;
DROP TYPE IF EXISTS submission_status CASCADE;
DROP TYPE IF EXISTS lead_status CASCADE;
DROP TYPE IF EXISTS follow_up_status CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;

-- New enums (matching Drizzle schema)
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('platform_admin','org_owner','org_admin','team_member'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE membership_status AS ENUM ('active','invited','suspended','removed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE agent_type AS ENUM ('quote','intake','follow_up','buyer_search','match','alert'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE submission_status AS ENUM ('new','reviewing','quoted','accepted','declined','closed','archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE pipeline_stage_type AS ENUM ('intake','qualifying','quoted','negotiating','won','lost'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE follow_up_status AS ENUM ('pending','sent','responded','skipped','failed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE notification_channel AS ENUM ('email','sms','in_app','webhook'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE subscription_status AS ENUM ('trialing','active','past_due','canceled','unpaid'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE file_type AS ENUM ('image','document','video','other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supabase_auth_id UUID UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  phone VARCHAR(50),
  platform_role user_role NOT NULL DEFAULT 'team_member',
  last_sign_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  industry VARCHAR(100),
  timezone VARCHAR(100) DEFAULT 'UTC',
  brand_config JSONB,
  stripe_customer_id VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- memberships
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'team_member',
  status membership_status NOT NULL DEFAULT 'active',
  invited_by_user_id UUID REFERENCES users(id),
  invited_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT memberships_user_org_unique UNIQUE (user_id, organization_id)
);

-- agents
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  type agent_type NOT NULL DEFAULT 'quote',
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  ai_config JSONB,
  intake_config JSONB,
  follow_up_config JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- intake_forms
CREATE TABLE intake_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  form_schema JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- submissions
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  submitter_name VARCHAR(255),
  submitter_email VARCHAR(255),
  submitter_phone VARCHAR(50),
  raw_data JSONB NOT NULL,
  ai_summary TEXT,
  ai_structured_data JSONB,
  ai_missing_fields JSONB,
  ai_suggested_next_steps JSONB,
  ai_processed_at TIMESTAMPTZ,
  status submission_status NOT NULL DEFAULT 'new',
  assigned_to_user_id UUID REFERENCES users(id),
  source_url TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- submission_files
CREATE TABLE submission_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  file_name VARCHAR(255) NOT NULL,
  file_type file_type NOT NULL DEFAULT 'other',
  mime_type VARCHAR(100),
  file_size_bytes INTEGER,
  storage_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID UNIQUE REFERENCES submissions(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  agent_id UUID REFERENCES agents(id),
  assigned_to_user_id UUID REFERENCES users(id),
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  company VARCHAR(255),
  current_stage_id UUID,
  score INTEGER DEFAULT 0,
  estimated_value DECIMAL(12,2),
  last_activity_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- pipeline_stages
CREATE TABLE pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  agent_id UUID REFERENCES agents(id),
  name VARCHAR(100) NOT NULL,
  type pipeline_stage_type NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  color VARCHAR(20),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- notes
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES submissions(id),
  author_user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- follow_ups
CREATE TABLE follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES submissions(id),
  scheduled_for TIMESTAMPTZ NOT NULL,
  channel notification_channel NOT NULL DEFAULT 'email',
  status follow_up_status NOT NULL DEFAULT 'pending',
  subject VARCHAR(255),
  body TEXT,
  is_ai_generated BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  channel notification_channel NOT NULL DEFAULT 'in_app',
  title VARCHAR(255) NOT NULL,
  body TEXT,
  action_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- analytics_events
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  agent_id UUID REFERENCES agents(id),
  user_id UUID REFERENCES users(id),
  event_name VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  properties JSONB,
  session_id VARCHAR(100),
  ip_address VARCHAR(45),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX analytics_events_org_idx ON analytics_events(organization_id);
CREATE INDEX analytics_events_agent_idx ON analytics_events(agent_id);
CREATE INDEX analytics_events_event_name_idx ON analytics_events(event_name);
CREATE INDEX analytics_events_occurred_idx ON analytics_events(occurred_at);

-- subscription_plans
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  setup_fee_min DECIMAL(10,2),
  setup_fee_max DECIMAL(10,2),
  monthly_fee_min DECIMAL(10,2),
  monthly_fee_max DECIMAL(10,2),
  stripe_product_id VARCHAR(100),
  stripe_price_id VARCHAR(100),
  features JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_public BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status subscription_status NOT NULL DEFAULT 'trialing',
  stripe_subscription_id VARCHAR(100),
  stripe_current_period_start TIMESTAMPTZ,
  stripe_current_period_end TIMESTAMPTZ,
  stripe_cancel_at_period_end BOOLEAN DEFAULT false,
  setup_fee_paid BOOLEAN DEFAULT false,
  setup_fee_amount DECIMAL(10,2),
  trial_ends_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Phase 2 tables (stubbed)
CREATE TABLE saved_search_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  agent_id UUID REFERENCES agents(id),
  name VARCHAR(255),
  category VARCHAR(100),
  search_criteria JSONB,
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE match_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saved_search_agent_id UUID REFERENCES saved_search_agents(id),
  user_id UUID REFERENCES users(id),
  profile_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE search_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saved_search_agent_id UUID REFERENCES saved_search_agents(id),
  user_id UUID REFERENCES users(id),
  match_score DECIMAL(5,2),
  matched_item_data JSONB,
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE shortlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  saved_search_agent_id UUID REFERENCES saved_search_agents(id),
  item_data JSONB NOT NULL,
  notes TEXT,
  rank INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
