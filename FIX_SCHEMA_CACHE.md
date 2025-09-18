# Fix for Supabase Schema Cache Issue

## Problem
The Supabase schema cache is not recognizing the columns in the `designacoes` table, causing errors when trying to insert or query data.

## Solution

### Option 1: Refresh Schema Cache via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the following SQL command:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```

### Option 2: Restart PostgREST Service

If the NOTIFY command doesn't work, you can restart the PostgREST service:

1. Go to your Supabase project dashboard
2. Navigate to Settings → Database
3. Find the "Restart PostgREST" button and click it

### Option 3: Wait for Automatic Refresh

The schema cache typically refreshes automatically every 10 minutes. You can wait for this automatic refresh.

## Verification

After applying one of the above solutions, you can verify the fix by running:

```javascript
const { supabase } = require('./config/supabase');
supabase.from('designacoes').insert({
  programacao_id: 'test-id',
  congregacao_id: 'test-cong-id'
}).then(result => {
  console.log('Insert result:', result);
});
```

## Alternative Implementation

If the schema cache issue persists, you can temporarily modify the designacoes route to use a more generic approach that doesn't rely on specific column validation:

```javascript
// In backend/routes/designacoes.js, replace the problematic insert with:
const { data: novaDesignacao, error: createError } = await supabase
  .from('designacoes')
  .insert([
    {
      programacao_id: programacao_id,
      congregacao_id: congregacao_id
    }
  ])
  .select()
  .single();
```

## Prevention

To prevent this issue in the future:
1. Always refresh the schema cache after making database schema changes
2. Consider adding a retry mechanism in your code for schema cache issues
3. Monitor Supabase logs for schema cache errors