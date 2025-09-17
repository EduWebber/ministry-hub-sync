# Student Data Import Process

## Overview
This document describes the complete process for importing student data from the spreadsheet into the ministry-hub-sync system.

## Process Steps

### 1. Convert Excel to JSON
The first step was to convert the Excel spreadsheet to JSON format using the existing Python script:
- Script: `convert_excel_to_json.py`
- Input: `docs/Oficial/estudantes_ficticios_corrigido_modelo.xlsx`
- Output: `estudantes_refinados_converted.json`

### 2. Review and Adjust Data
The JSON data was reviewed and adjusted to match the current database schema:
- Mapped spreadsheet fields to database columns
- Ensured data types were compatible
- Handled special cases like family relationships

### 3. Create Batch Processing Function
A PostgreSQL function was created to handle batch imports:
- Function: `process_estudantes_batch`
- File: `supabase/migrations/20250917080000_create_batch_student_import_function.sql`
- Capable of processing student data in batches to avoid size limits

### 4. Generate Import Commands
A script was created to generate SQL commands for importing the data:
- Script: `generate_import_commands.js`
- Splits the data into batches of 20 students
- Generates SELECT statements to call the batch processing function

### 5. Execute Import
The generated SQL commands need to be executed in the Supabase dashboard:
- Follow the instructions in `IMPORT_INSTRUCTIONS.md`
- Execute each batch command one by one
- Monitor for any errors during the import process

### 6. Verify Import
After importing the data, verify the import was successful:
- Run the verification script: `verify_import.js`
- Check that the correct number of students were imported
- Confirm that profiles were created correctly
- Verify family relationships (if applicable)

## Files Created

1. `convert_excel_to_json.py` - Script to convert Excel to JSON
2. `estudantes_refinados_converted.json` - Converted student data
3. `supabase/migrations/20250917080000_create_batch_student_import_function.sql` - Database migration with batch processing function
4. `generate_import_commands.js` - Script to generate SQL import commands
5. `IMPORT_INSTRUCTIONS.md` - Instructions for executing import commands
6. `verify_import.js` - Script to verify the data import
7. `STUDENT_IMPORT_README.md` - This document

## Usage Instructions

1. Ensure the database migration is applied to create the batch processing function
2. Run `generate_import_commands.js` to generate the SQL commands
3. Execute the SQL commands in the Supabase dashboard following `IMPORT_INSTRUCTIONS.md`
4. Run `verify_import.js` to verify the import was successful

## Troubleshooting

If you encounter issues during the import process:
1. Check that all environment variables are properly set
2. Verify that the database schema matches the expected structure
3. Ensure the batch processing function exists in the database
4. Check for any error messages during the import process
5. Contact the development team for assistance if needed