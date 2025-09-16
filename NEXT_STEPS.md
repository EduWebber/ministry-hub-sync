# Next Steps to Fix Supabase Configuration

## ✅ Completed Steps
1. Updated all configuration files to use the correct Supabase URL: `https://nwpuurgwnnuejqinkvrh.supabase.co`
2. Updated API keys in [.env](file:///c:/Users/webbe/OneDrive/Documents/GitHub/ministry-hub-sync/.env) files with placeholders
3. Updated CORS configuration to match new frontend port (8081)
4. Restarted frontend (port 8081) and backend (port 3000) servers

## ⚠️ Remaining Issues
1. **Invalid API Keys**: The application is currently using placeholder keys and will not be able to connect to Supabase
2. **RLS Policy Recursion**: The infinite recursion error in profiles table policies still needs to be resolved

## 🔧 Required Actions

### 1. Get Valid Supabase Keys
1. Go to your Supabase project dashboard: https://app.supabase.com/project/nwpuurgwnnuejqinkvrh
2. Navigate to Project Settings > API
3. Copy the following keys:
   - **anon key** (for VITE_SUPABASE_ANON_KEY)
   - **service_role key** (for SUPABASE_SERVICE_ROLE_KEY)
4. Update both [.env](file:///c:/Users/webbe/OneDrive/Documents/GitHub/ministry-hub-sync/.env) files with these valid keys:
   - Root [.env](file:///c:/Users/webbe/OneDrive/Documents/GitHub/ministry-hub-sync/.env) file
   - Backend [.env](file:///c:/Users/webbe/OneDrive/Documents/GitHub/ministry-hub-sync/backend/.env) file

### 2. Apply RLS Policy Fixes
The infinite recursion error is caused by circular references in the Row Level Security policies. To fix this:

1. Go to Supabase Dashboard > SQL Editor
2. Run the SQL commands from the `fix-rls-policies.sql` file or the `apply-rls-fix.js` script
3. The key commands are:
   ```sql
   -- Drop problematic policies
   DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
   DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
   
   -- Create simple, non-recursive policies
   CREATE POLICY "profiles_select_policy" ON profiles FOR SELECT USING (true);
   CREATE POLICY "profiles_insert_policy" ON profiles FOR INSERT WITH CHECK (true);
   CREATE POLICY "profiles_update_policy" ON profiles FOR UPDATE USING (true);
   
   -- Enable RLS
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ```

### 3. Test the Application
After completing the above steps:
1. Restart both frontend and backend servers
2. Access the application at http://localhost:8081
3. Try to log in to verify the authentication is working
4. Check that the infinite recursion error is resolved

## 📝 Additional Notes
- The frontend is now running on port 8081 (due to port 8080 being occupied)
- The backend is running on port 3000
- Make sure to clear browser cache/cookies if you still see issues
- Check browser console for any remaining errors