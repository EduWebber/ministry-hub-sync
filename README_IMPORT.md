# Student Data Import Instructions

## Overview

This repository contains all the necessary files and instructions to import student data from your spreadsheet into the Ministry Hub Sync system.

## Files

1. `estudantes_refinados_converted.json` - The student data converted from your spreadsheet (101 students)
2. `batch_import_function.sql` - The PostgreSQL function to process student data in batches
3. `import_commands.sql` - The SQL commands to import all students in batches of 20
4. `INSTRUCTIONS.md` - Detailed step-by-step instructions

## How to Import the Data

### Step 1: Create the Batch Import Function

1. Go to the [Supabase Dashboard](https://app.supabase.com/)
2. Log in and select your project
3. Navigate to the SQL Editor
4. Open and execute `batch_import_function.sql`

### Step 2: Import the Student Data

1. In the Supabase SQL Editor, open `import_commands.sql`
2. Execute each batch command one by one
   - There are 6 batches of students (20 students per batch, except the last one with 1 student)
   - Each command starts with `SELECT * FROM process_estudantes_batch(...)`

### Step 3: Verify the Import

After importing, you can verify the data was imported correctly by running:

```sql
SELECT COUNT(*) FROM estudantes;
SELECT COUNT(*) FROM profiles;
```

Both should return 101.

## Troubleshooting

If you encounter any issues:

1. Make sure you're using the correct project in Supabase
2. Ensure you have the necessary permissions (service role key)
3. Check that the tables `estudantes` and `profiles` exist in your database
4. If there are any errors, they will be returned by the function and will help you identify what needs to be fixed

## Support

If you need help with the import process, please reach out for assistance.