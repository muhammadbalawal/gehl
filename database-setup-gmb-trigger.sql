-- Database Trigger Setup for GMB Scraping
-- Run this in your Supabase SQL Editor

-- Step 1: Enable the http extension (if not already enabled)
-- This allows us to make HTTP requests from database functions
CREATE EXTENSION IF NOT EXISTS http;

-- Step 2: Create the trigger function
CREATE OR REPLACE FUNCTION trigger_gmb_scraping()
RETURNS trigger AS $$
DECLARE
    edge_function_url text;
    response_status int;
BEGIN
    -- Only trigger if gmb_link is provided and not null
    IF NEW.gmb_link IS NOT NULL AND NEW.gmb_link != '' THEN
        
        -- Construct the Edge Function URL
        -- Replace 'your-project-ref' with your actual Supabase project reference
        edge_function_url := 'https://your-project-ref.supabase.co/functions/v1/scrape-gmb';
        
        -- Log the trigger execution
        RAISE NOTICE 'Triggering GMB scraping for lead_id: %, gmb_link: %', NEW.id, NEW.gmb_link;
        
        -- Make HTTP request to Edge Function
        -- Using http extension (simpler alternative)
        SELECT status INTO response_status FROM http_post(
            edge_function_url,
            jsonb_build_object(
                'lead_id', NEW.id,
                'gmb_link', NEW.gmb_link,
                'user_id', NEW.user_id
            )::text,
            'application/json'::text
        );
        
        -- Log the response (optional, for debugging)
        RAISE NOTICE 'HTTP request sent with status: %', response_status;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create the trigger
DROP TRIGGER IF EXISTS gmb_scraping_trigger ON lead;
CREATE TRIGGER gmb_scraping_trigger
    AFTER INSERT ON lead
    FOR EACH ROW
    EXECUTE FUNCTION trigger_gmb_scraping();

-- Step 4: Test the trigger (optional)
-- Uncomment and run this to test the trigger without actually inserting data
-- SELECT trigger_gmb_scraping();

-- Step 5: Grant necessary permissions (not needed for http extension)
-- The http extension works out of the box

-- Notes:
-- 1. Replace 'your-project-ref' with your actual Supabase project reference
-- 2. You'll need to set up the service role key in Step 2
-- 3. This trigger will fire after every lead insert that has a gmb_link 