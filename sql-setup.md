# RLS Policies for Gehl App

Run these SQL commands in your Supabase SQL Editor to set up proper Row Level Security:

## Campaign Table Policies

```sql
-- Enable RLS on campaign table (if not already enabled)
ALTER TABLE campaign ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own campaigns
CREATE POLICY "Users can view own campaigns" ON campaign
  FOR SELECT 
  USING (user_id = auth.uid() OR user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Allow users to insert their own campaigns
CREATE POLICY "Users can insert own campaigns" ON campaign
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() OR user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Allow users to update their own campaigns
CREATE POLICY "Users can update own campaigns" ON campaign
  FOR UPDATE 
  USING (user_id = auth.uid() OR user_id::text = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (user_id = auth.uid() OR user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Allow users to delete their own campaigns
CREATE POLICY "Users can delete own campaigns" ON campaign
  FOR DELETE 
  USING (user_id = auth.uid() OR user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');
```

## Lead Table Policies

```sql
-- Enable RLS on lead table (if not already enabled)
ALTER TABLE lead ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own leads
CREATE POLICY "Users can view own leads" ON lead
  FOR SELECT 
  USING (user_id = auth.uid() OR user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Allow users to insert their own leads
CREATE POLICY "Users can insert own leads" ON lead
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() OR user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Allow users to update their own leads
CREATE POLICY "Users can update own leads" ON lead
  FOR UPDATE 
  USING (user_id = auth.uid() OR user_id::text = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (user_id = auth.uid() OR user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Allow users to delete their own leads
CREATE POLICY "Users can delete own leads" ON lead
  FOR DELETE 
  USING (user_id = auth.uid() OR user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');
```

## Temporary Policy for Development (without auth)

If you want to test without authentication during development, you can temporarily add these more permissive policies:

```sql
-- TEMPORARY: Allow all operations for development
-- Remove these when implementing real authentication

CREATE POLICY "dev_campaign_access" ON campaign
  FOR ALL 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "dev_lead_access" ON lead
  FOR ALL 
  USING (true)
  WITH CHECK (true);
```

## Steps to Implement:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run the SQL commands above
4. Test your application

## When Adding Real Authentication:

1. Remove the temporary development policies
2. The main policies will automatically work with Supabase Auth
3. Replace your dummy user_id with `auth.uid()` in your application code 