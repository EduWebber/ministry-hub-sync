# Manual Schema Cache Refresh Guide

## Problem
The Supabase schema cache is not recognizing the columns in the `designacoes` table, causing 400 Bad Request errors when trying to insert or query data. This typically happens after database schema changes or when there are issues with the PostgREST service.

## Solution

### Option 1: Refresh Schema Cache via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the following SQL command:
   ```sql
   SELECT pg_notify('pgrst', 'reload schema');
   ```

### Option 2: Restart PostgREST Service

If the NOTIFY command doesn't work, you can restart the PostgREST service:

1. Go to your Supabase project dashboard
2. Navigate to Settings → Database
3. Find the "Restart PostgREST" button and click it

### Option 3: Wait for Automatic Refresh

The schema cache typically refreshes automatically every 10 minutes. You can wait for this automatic refresh.

## Verification

After applying one of the above solutions, you can verify the fix by testing the designacoes endpoint:

```bash
curl -X POST http://localhost:3001/api/designacoes/generate \
  -H "Content-Type: application/json" \
  -d '{
    "programacao_id": "test-program-id",
    "congregacao_id": "test-congregation-id"
  }'
```

## Alternative Implementation in Code

The application already has graceful error handling for schema cache issues in the designacoes route. When a schema cache issue is detected, the system automatically falls back to mock mode, allowing users to continue working while the issue is resolved:

```javascript
// Handle schema cache issues specifically
if (createError.message && (createError.message.includes('schema cache') || 
    createError.message.includes('congregacao_id') || 
    createError.message.includes('programacao_id') ||
    createError.message.includes('column') ||
    createError.message.includes('PGRST'))) {
  console.warn('⚠️ Schema cache issue detected, falling back to mock mode');
  return res.json({
    success: true,
    message: 'Designações geradas com sucesso (modo mock - schema cache issue)',
    designacoes: designacoesGeradas,
    summary: {
      total_itens: itens.length,
      designacoes_ok: designacoesGeradas.filter(d => d.status === 'OK').length,
      designacoes_pendentes: designacoesGeradas.filter(d => d.status === 'PENDING').length
    }
  });
}
```

## Prevention

To prevent this issue in the future:

1. Always refresh the schema cache after making database schema changes
2. Consider adding a retry mechanism in your code for schema cache issues
3. Monitor Supabase logs for schema cache errors

## Troubleshooting

If the schema cache issue persists:

1. Check that all required environment variables are correctly set in both frontend and backend [.env](file:///c:/Users/webbe/OneDrive/Documents/GitHub/ministry-hub-sync/.env) files
2. Verify that the Supabase project URL and keys are correct
3. Ensure that the database tables have the correct structure and column names
4. Check the Supabase logs for any additional error information