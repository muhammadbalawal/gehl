# GMB Scraping Setup - Deployment Guide

Follow these steps to set up automatic GMB scraping when leads are imported.

## Prerequisites

1. **Supabase CLI installed**
   ```bash
   npm install -g supabase
   ```

2. **Your Supabase project details**
   - Project URL
   - Service Role Key (found in Project Settings > API)
   - Project Reference ID

## Step 1: Deploy the Edge Function (10 minutes)

### 1.1 Login to Supabase CLI
```bash
supabase login
```

### 1.2 Link your project
```bash
# Replace 'your-project-ref' with your actual project reference
supabase link --project-ref your-project-ref
```

### 1.3 Deploy the Edge Function
```bash
supabase functions deploy scrape-gmb
```

### 1.4 Get Google Places API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Places API (New)** and **Places API** 
4. Go to **Credentials** > **Create Credentials** > **API Key**
5. Copy your API key

### 1.5 Set Environment Variables
Go to your Supabase Dashboard > Edge Functions > scrape-gmb > Settings

Add these environment variables:
- `SUPABASE_URL`: Your project URL (e.g., https://xxx.supabase.co)  
- `SUPABASE_SERVICE_ROLE_KEY`: Your service role key
- `GOOGLE_PLACES_API_KEY`: Your Google Places API key from step 1.4

## Step 2: Set Up Database Trigger (5 minutes)

### 2.1 Update the SQL file
1. Open `database-setup-gmb-trigger.sql`
2. Replace `your-project-ref` with your actual Supabase project reference
3. The URL should look like: `https://your-project-ref.supabase.co/functions/v1/scrape-gmb`

### 2.2 Run the SQL in Supabase
1. Go to Supabase Dashboard > SQL Editor
2. Create a new query
3. Copy and paste the entire content of `database-setup-gmb-trigger.sql`
4. Click "Run"

### 2.3 Enable Required Extensions
If you get errors, run these commands first:
```sql
-- Enable HTTP extension for making requests
CREATE EXTENSION IF NOT EXISTS http;

-- Enable pg_net extension for better async requests
CREATE EXTENSION IF NOT EXISTS pg_net;
```

## Step 3: Test the System (5 minutes)

### 3.1 Test Edge Function Directly
```bash
# Test the function with curl
curl -X POST 'https://your-project-ref.supabase.co/functions/v1/scrape-gmb' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "lead_id": 999,
    "gmb_link": "https://maps.app.goo.gl/test",
    "user_id": "test-user-id"
  }'
```

### 3.2 Test with Lead Import
1. Go to your app's lead import page
2. Upload a CSV with a lead that has a **real GMB link** (e.g., `https://maps.app.goo.gl/xyz` or `https://www.google.com/maps/place/Business+Name`)
3. Check the Supabase Dashboard > Table Editor > `gmb` table
4. You should see **real GMB data** from Google Places API appear within 30 seconds

**Example GMB links that work:**
- `https://maps.app.goo.gl/ABC123`
- `https://www.google.com/maps/place/Starbucks/@40.7128,-74.0060`
- `https://maps.google.com/maps?cid=1234567890`

### 3.3 Monitor Logs
Check Edge Function logs in Supabase Dashboard > Edge Functions > scrape-gmb > Logs

## Step 4: Troubleshooting

### Common Issues:

**1. "Extension http does not exist"**
```sql
CREATE EXTENSION IF NOT EXISTS http;
```

**2. "Function scrape-gmb not found"**
- Check if the Edge Function deployed correctly: `supabase functions list`
- Verify the URL in your database trigger

**3. "Permission denied for function net.http_post"**
```sql
GRANT USAGE ON SCHEMA net TO postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA net TO postgres;
```

**4. "Environment variables not found"**
- Double-check environment variables in Supabase Dashboard
- Make sure variable names match exactly

### Useful Commands:

```bash
# List all functions
supabase functions list

# View function logs
supabase functions logs scrape-gmb

# Delete function (if needed)
supabase functions delete scrape-gmb

# Redeploy function
supabase functions deploy scrape-gmb --no-verify-jwt
```

## Step 5: Production Enhancements (Optional)

### 5.1 Google Places API Integration ✅
**Already implemented!** The Edge Function now uses the official Google Places API to extract real GMB data including:

- ⭐ **Rating & Reviews**: Actual Google ratings and recent customer reviews
- 🕐 **Business Hours**: Real opening hours for each day of the week  
- 📍 **Address**: Formatted business address
- 📷 **Photo Count**: Number of photos available
- 🏷️ **Categories**: Business type classifications
- 📈 **Review Count**: Total number of reviews

**Supported GMB Link Formats:**
- Short links: `https://maps.app.goo.gl/ABC123`
- Full URLs: `https://www.google.com/maps/place/Business+Name/@lat,lng`
- Place ID links: `https://maps.google.com/?cid=123456789`
- Search URLs: `https://maps.google.com/maps?q=Business+Name`

### 5.2 Add Error Handling and Retries
```sql
-- Add a retry mechanism to your trigger
CREATE OR REPLACE FUNCTION trigger_gmb_scraping_with_retry()
RETURNS trigger AS $$
BEGIN
  -- Try up to 3 times with exponential backoff
  FOR i IN 1..3 LOOP
    BEGIN
      -- Your existing HTTP call here
      EXIT; -- Success, exit loop
    EXCEPTION
      WHEN OTHERS THEN
        IF i = 3 THEN
          RAISE; -- Re-raise after 3 attempts
        END IF;
        PERFORM pg_sleep(power(2, i)); -- Wait 2^i seconds
    END;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 5.3 Add Real-time Updates to Your UI
```typescript
// In your React components, listen for GMB data updates
const { data: gmbData } = useSupabaseRealtime('gmb', {
  filter: `lead_id=eq.${leadId}`
})

useEffect(() => {
  if (gmbData) {
    // Update UI when GMB data arrives
    setLeadGmbData(gmbData)
  }
}, [gmbData])
```

## Success! 🎉

Your system is now set up to automatically scrape GMB data when leads are imported. Every time a lead with a `gmb_link` is added to your database, the Edge Function will:

1. ✅ Receive the trigger from the database
2. ✅ Scrape GMB data from the provided link  
3. ✅ Store the data in your `gmb` table
4. ✅ Link it to the correct lead

Monitor the Edge Function logs to see it working in real-time! 