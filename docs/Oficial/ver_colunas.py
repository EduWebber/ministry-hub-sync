import pandas as pd

input_file = r"C:\Users\webbe\OneDrive\Documents\GitHub\ministry-hub-sync\docs\Oficial\estudantes_ficticios_corrigido_modelo.xlsx"
df = pd.read_excel(input_file)

print("Colunas encontradas na planilha:")
print(df.columns.tolist())
