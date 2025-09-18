import pandas as pd
import uuid
from datetime import datetime
import numpy as np

# Create a DataFrame with the provided data
data = [
    # Data from your message - I'll parse this properly
    ["014e0c2e-7e15-484c-bea8-fc6e72e8bc5d", "8c3813d7-4191-4b2d-81d0-618d9ff2c4be", "André Gomes", "Gomes", 62, "masculino", "andré.gomes@exemplo.com", "(33) 9428-9154", "2018-09-29 00:00:00", 7, "anciao", True, "Instrutor", "2025-08-15 15:31:50", "2025-08-15 15:31:50", "casado", "pai", "9e4ab2e3-98ca-4e69-ace1-f9278aa12e01", None, None, True, False, "8c3813d7-4191-4b2d-81d0-618d9ff2c4be", "9e4ab2e3-98ca-4e69-ace1-f9278aa12e01", True, True, True, True, True, True, True, True, True, True, True, True, "1968-08-29 00:00:00", "2018-09-29 00:00:00"],
    ["014e0c2e-7e15-484c-bea8-fc6e72e8bc5d", "ae709551-ba64-44ed-8dd1-4bf1c4d2cc06", "Eduardo Gomes", "Gomes", 46, "masculino", "eduardo.gomes@exemplo.com", "(45) 9579-9996", "2018-08-03 00:00:00", 7, "anciao", True, "Instrutor", "2025-08-15 15:31:50", "2025-08-15 15:31:50", "viúvo", "filho", "8c3813d7-4191-4b2d-81d0-618d9ff2c4be", "9e4ab2e3-98ca-4e69-ace1-f9278aa12e01", None, True, False, "8c3813d7-4191-4b2d-81d0-618d9ff2c4be", "9e4ab2e3-98ca-4e69-ace1-f9278aa12e01", True, True, True, True, True, True, True, True, True, True, True, True, "1979-08-27 00:00:00", "2018-08-03 00:00:00"],
    # Add more rows as needed
]

# Column names as per the Excel file
columns = [
    "family_id", "user_id", "nome", "familia", "idade", "genero", "email", "telefone", 
    "data_batismo", "tempo", "cargo", "ativo", "observacoes", "created_at", "updated_at", 
    "estado_civil", "papel_familiar", "id_pai", "id_mae", "id_conjuge", "coabitacao", 
    "menor", "responsavel_primario", "responsavel_secundario", "chairman", "pray", 
    "tresures", "gems", "reading", "starting", "following", "making", "explaining", 
    "talk", "data_nascimento", "data_de_matricula"
]

# Create DataFrame
df = pd.DataFrame(data, columns=columns)

# Convert date columns to proper datetime format
date_columns = ["data_batismo", "created_at", "updated_at", "data_nascimento", "data_de_matricula"]
for col in date_columns:
    df[col] = pd.to_datetime(df[col], errors='coerce')

# Convert boolean columns
bool_columns = ["ativo", "coabitacao", "menor", "chairman", "pray", "tresures", "gems", 
                "reading", "starting", "following", "making", "explaining", "talk"]
for col in bool_columns:
    df[col] = df[col].astype('boolean')

# Save to Excel
output_file = r"C:\Users\webbe\OneDrive\Documents\GitHub\ministry-hub-sync\docs\Oficial\estudantes_corrigidos.xlsx"
df.to_excel(output_file, index=False)
print(f"✅ Spreadsheet updated and saved to: {output_file}")
print(f"Total records: {len(df)}")