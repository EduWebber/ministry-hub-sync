# 🔧 Supabase Schema Relationship Fix

## 🚨 Problem Summary
The frontend is getting 400 Bad Request errors when trying to access the [`estudantes`](file://c:\Users\webbe\Documents\GitHub\ministry-hub-sync\src\hooks\useOfflineData.ts#L7-L7) table with joins to [`profiles`](file://c:\Users\webbe\Documents\GitHub\ministry-hub-sync\src\pages\InstructorProgramacao.tsx#L57-L60):

```
Error: Could not find a relationship between 'estudantes' and 'profiles' in the schema cache
```

## 🔍 Root Cause
1. **Missing Foreign Key Constraint**: The relationship between `estudantes.profile_id` and `profiles.id` may not be properly defined
2. **PostgREST Cache Issue**: Supabase's PostgREST cache may not have recognized relationship changes
3. **RLS Policy Conflicts**: Row Level Security policies may be too restrictive

## ✅ Solution Steps

### 1. Run the Database Fix Script
Execute the SQL script `fix-supabase-schema-relationships.sql` in your Supabase dashboard:

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Run the fix script
4. Check the output for any errors

### 2. Updated Frontend Code
The [`useEstudantes`](file://c:\Users\webbe\Documents\GitHub\ministry-hub-sync\src\hooks\useEstudantes.ts#L232-L284) hook has been updated with fallback logic:

- **Primary approach**: Try the relationship join query
- **Fallback**: If relationship fails, fetch tables separately and join in JavaScript
- **Error handling**: Graceful degradation without breaking the UI

### 3. Verification

#### Backend Verification:
```bash
# Test the API endpoint
curl "http://localhost:3001/api/estudantes" | jq

# Check if backend can access the data
curl "http://localhost:3001/api/status" | jq
```

#### Frontend Verification:
```bash
# Clear browser cache and localStorage
# Open browser console and check for errors
# Navigate to http://localhost:8080/estudantes
```

## 🧪 Testing the Fix

### Test 1: Direct Database Query
```sql
SELECT 
    e.id,
    e.genero,
    e.ativo,
    p.nome,
    p.email
FROM estudantes e
JOIN profiles p ON e.profile_id = p.id
WHERE e.ativo = true
LIMIT 5;
```

### Test 2: Frontend API Call
```javascript
// Test in browser console
const { data, error } = await supabase
  .from('estudantes')
  .select('*, profiles!inner(*)')
  .eq('ativo', true)
  .limit(5);

console.log('Data:', data);
console.log('Error:', error);
```

### Test 3: Check Relationship in Supabase Dashboard
1. Go to Table Editor → estudantes
2. Check if profile_id has a foreign key icon
3. Try to view related profiles data

## 🛠️ Alternative Solutions

### Option A: Use Profile ID Array Query
If relationships still don't work, fetch profiles separately:

```javascript
// 1. Get estudantes
const { data: estudantes } = await supabase
  .from('estudantes')
  .select('*')
  .eq('ativo', true);

// 2. Get unique profile IDs
const profileIds = [...new Set(estudantes.map(e => e.profile_id))];

// 3. Get profiles
const { data: profiles } = await supabase
  .from('profiles')
  .select('*')
  .in('id', profileIds);

// 4. Join in JavaScript
const estudantesWithProfiles = estudantes.map(e => ({
  ...e,
  profile: profiles.find(p => p.id === e.profile_id)
}));
```

### Option B: Database View
Create a database view to simplify queries:

```sql
CREATE OR REPLACE VIEW estudantes_complete AS
SELECT 
    e.*,
    p.nome as profile_nome,
    p.email as profile_email,
    p.telefone as profile_telefone,
    p.cargo as profile_cargo
FROM estudantes e
LEFT JOIN profiles p ON e.profile_id = p.id;

-- Grant access
GRANT SELECT ON estudantes_complete TO authenticated;
```

## 📋 Files Modified

1. **`src/hooks/useEstudantes.ts`** - Added fallback logic for relationship queries
2. **`fix-supabase-schema-relationships.sql`** - Database schema fix script
3. **`SUPABASE_SCHEMA_FIX.md`** - This documentation

## 🔍 Debugging Commands

### Check Current Schema:
```sql
-- Check foreign keys
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'estudantes';
```

### Check RLS Policies:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename IN ('estudantes', 'profiles')
ORDER BY tablename, policyname;
```

### Check Data Integrity:
```sql
-- Check for orphaned estudantes
SELECT COUNT(*) as orphaned_count
FROM estudantes e
LEFT JOIN profiles p ON e.profile_id = p.id
WHERE p.id IS NULL AND e.ativo = true;
```

## 🎯 Expected Results

After applying the fix:

1. ✅ No more 400 Bad Request errors
2. ✅ [`useEstudantes`](file://c:\Users\webbe\Documents\GitHub\ministry-hub-sync\src\hooks\useEstudantes.ts#L232-L284) hook loads data successfully
3. ✅ Students page displays the list properly
4. ✅ Relationship queries work in Supabase dashboard
5. ✅ No console errors in browser

## 🚨 If Issues Persist

1. **Check Supabase Service Status**: Visit https://status.supabase.com
2. **Refresh PostgREST**: Run `NOTIFY pgrst, 'reload schema';` in SQL editor
3. **Verify Environment Variables**: Ensure frontend and backend use same Supabase URL
4. **Contact Support**: If relationship issues persist, contact Supabase support

---

**Status**: Ready to apply  
**Priority**: High  
**Impact**: Fixes critical data loading issues