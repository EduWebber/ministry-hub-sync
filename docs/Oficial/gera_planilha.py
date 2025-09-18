import pandas as pd
import random
import uuid
from datetime import datetime

# Simple fake data without faker
first_names_male = ['João', 'Pedro', 'Lucas', 'Mateus', 'Gabriel', 'Rafael', 'Thiago', 'Eduardo', 'André', 'Bruno']
first_names_female = ['Ana', 'Maria', 'Beatriz', 'Camila', 'Carla', 'Fernanda', 'Juliana', 'Larissa', 'Luana', 'Patrícia']
last_names = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes']

def fake_name(genero='M'):
    first = random.choice(first_names_male) if genero == 'M' else random.choice(first_names_female)
    return f"{first} {random.choice(last_names)}"

def fake_last_name():
    return random.choice(last_names)

def fake_phone():
    return f"({random.randint(11,99)}) {random.randint(90000,99999)}-{random.randint(1000,9999)}"

def fake_email(nome):
    domains = ['gmail.com', 'hotmail.com', 'yahoo.com']
    return f"{nome.lower().replace(' ', '.')}@{random.choice(domains)}"

# 📂 Caminhos
input_file = r"C:\Users\webbe\OneDrive\Documents\GitHub\ministry-hub-sync\docs\Oficial\estudantes_ficticios_corrigido_modelo.xlsx"
output_file = r"C:\Users\webbe\OneDrive\Documents\GitHub\ministry-hub-sync\docs\Oficial\estudantes_corrigidos.xlsx"

print(f"📂 Lendo planilha: {input_file}")
df = pd.read_excel(input_file)

# 📌 Lista de colunas obrigatórias
colunas_necessarias = [
    "family_id", "user_id", "nome", "familia", "idade", "genero",
    "email", "telefone", "data_batismo", "tempo", "cargo", "ativo",
    "observacoes", "created_at", "updated_at", "estado_civil", "papel_familiar",
    "id_pai", "id_mae", "id_conjuge", "coabitacao", "menor",
    "responsavel_primario", "responsavel_secundario",
    "chairman", "pray", "tresures", "gems", "reading", "starting",
    "following", "making", "explaining", "talk",
    "data_nascimento", "data_de_matricula"
]

# Garantir que todas existam
for col in colunas_necessarias:
    if col not in df.columns:
        if col == "idade":
            df[col] = 0
        elif col in ["ativo", "menor", "chairman", "pray", "tresures", "gems",
                     "reading", "starting", "following", "making", "explaining", "talk"]:
            df[col] = False
        else:
            df[col] = None

# Garantir tipos booleanos nas colunas de participação
particip_cols = ["chairman", "pray", "tresures", "gems",
                 "reading", "starting", "following", "making", "explaining", "talk"]
for col in particip_cols:
    df[col] = df[col].astype(bool)

ANO_ATUAL = datetime.now().year

# 📌 Regras de participações por cargo
regras_participacoes = {
    "anciao":                  [True, True, True, True, True, True, True, True, True, True],
    "servo_ministerial":       [False, True, True, True, True, True, True, True, True, True],
    "pioneiro_regular":        [False, True, False, False, True, True, True, True, True, True],
    "pioneira_regular":        [False, False, False, False, False, True, True, True, True, False],
    "publicador_batizado":     [False, True, False, False, True, True, True, True, True, True],
    "publicadora_batizada":    [False, False, False, False, False, True, True, True, True, False],
    "publicador_nao_batizado": [False, False, False, False, True, True, True, True, True, False],
    "publicadora_nao_batizada":[False, False, False, False, False, True, True, True, True, False],
    "estudante_novo":          [False, False, False, False, True, True, True, True, True, False],
    "estudante_nova":          [False, False, False, False, False, True, True, True, True, False],
}

# 🚀 Correções linha a linha
for idx, row in df.iterrows():
    cargo = str(row["cargo"]).strip().lower() if pd.notna(row["cargo"]) else "estudante_novo"

    # Nome completo obrigatório e >=2 chars
    if pd.isna(row["nome"]) or len(str(row["nome"]).strip()) < 2:
        genero_row = str(row["genero"]).upper() if not pd.isna(row["genero"]) else 'M'
        df.at[idx, "nome"] = fake_name(genero_row)

    # Família obrigatória
    if pd.isna(row["familia"]) or str(row["familia"]).strip() == "":
        df.at[idx, "familia"] = fake_last_name()

    # Gênero M ou F (capitalizado)
    if pd.isna(row["genero"]) or str(row["genero"]).upper() not in ["M", "F"]:
        df.at[idx, "genero"] = random.choice(["M", "F"])

    # Idade
    try:
        idade = int(row["idade"])
        if idade < 1 or idade > 120:
            raise ValueError
    except:
        idade = random.randint(5, 90)
        df.at[idx, "idade"] = idade

    # Data de nascimento coerente com idade
    try:
        nascimento = pd.to_datetime(row["data_nascimento"], errors="coerce")
        if pd.isna(nascimento):
            raise ValueError
    except:
        nascimento = datetime(ANO_ATUAL - idade, random.randint(1, 12), random.randint(1, 28))
        df.at[idx, "data_nascimento"] = nascimento.strftime("%Y-%m-%d")

    # Menor baseado em idade
    df.at[idx, "menor"] = idade < 18

    # Responsável para menores (primário obrigatório, secundário opcional)
    if df.at[idx, "menor"]:
        if pd.isna(row["responsavel_primario"]) or str(row["responsavel_primario"]).strip() == "":
            df.at[idx, "responsavel_primario"] = str(uuid.uuid4())
        if pd.isna(row["responsavel_secundario"]) or str(row["responsavel_secundario"]).strip() == "":
            df.at[idx, "responsavel_secundario"] = str(uuid.uuid4()) if random.random() > 0.5 else ""

    # 🔹 Estudantes/Não batizados → matrícula obrigatória, sem batismo
    if cargo in ["estudante_novo", "estudante_nova", "publicador_nao_batizado", "publicadora_nao_batizada"]:
        df.at[idx, "data_batismo"] = None
        min_ano = int(nascimento.year) + 10
        max_ano = ANO_ATUAL
        if min_ano > max_ano:
            # Adjust age down to make possible (young student)
            new_idade = random.randint(1, 9)  # Ensure +10 <= current
            nascimento = datetime(ANO_ATUAL - new_idade, random.randint(1, 12), random.randint(1, 28))
            df.at[idx, "idade"] = new_idade
            df.at[idx, "data_nascimento"] = nascimento.strftime("%Y-%m-%d")
            min_ano = int(nascimento.year) + 10
        ano_matricula = random.randint(min_ano, max_ano)
        data_matricula = datetime(ano_matricula, random.randint(1, 12), random.randint(1, 28))
        df.at[idx, "data_de_matricula"] = data_matricula.strftime("%Y-%m-%d")
        ref_date_str = df.at[idx, "data_de_matricula"]
    else:
        # 🔹 Batizados → batismo obrigatório ≥10 anos após nascimento
        try:
            batismo = pd.to_datetime(row["data_batismo"], errors="coerce")
            if pd.isna(batismo) or batismo.year < nascimento.year + 10:
                raise ValueError
        except:
            min_ano = int(nascimento.year) + 10
            max_ano = ANO_ATUAL - 1
            if min_ano > max_ano:
                # Adjust age up to make possible (older person)
                new_idade = random.randint(11, 90)
                nascimento = datetime(ANO_ATUAL - new_idade, random.randint(1, 12), random.randint(1, 28))
                df.at[idx, "idade"] = new_idade
                df.at[idx, "data_nascimento"] = nascimento.strftime("%Y-%m-%d")
                min_ano = int(nascimento.year) + 10
            ano_batismo = random.randint(min_ano, max_ano)
            batismo = datetime(ano_batismo, random.randint(1, 12), random.randint(1, 28))
            df.at[idx, "data_batismo"] = batismo.strftime("%Y-%m-%d")
        df.at[idx, "data_de_matricula"] = df.at[idx, "data_batismo"]
        ref_date_str = df.at[idx, "data_batismo"]

    # 🔹 Tempo (anos desde referência)
    if pd.notna(ref_date_str):
        ref_date = pd.to_datetime(ref_date_str, errors="coerce")
        df.at[idx, "tempo"] = int(ANO_ATUAL - ref_date.year) if pd.notna(ref_date) else 0
    else:
        df.at[idx, "tempo"] = 0

    anos_batismo = int(df.at[idx, "tempo"])

    # 📌 Regras específicas de cargo
    if cargo == "anciao":
        if df.at[idx, "idade"] < 21:
            df.at[idx, "idade"] = random.randint(21, 80)
            # Recalcular nascimento e ref_date se idade mudou
            nascimento = datetime(ANO_ATUAL - df.at[idx, "idade"], random.randint(1, 12), random.randint(1, 28))
            df.at[idx, "data_nascimento"] = nascimento.strftime("%Y-%m-%d")
        if anos_batismo < 4:
            df.at[idx, "data_batismo"] = datetime(ANO_ATUAL - 4, random.randint(1, 12), random.randint(1, 28)).strftime("%Y-%m-%d")
            df.at[idx, "data_de_matricula"] = df.at[idx, "data_batismo"]
            # Recalcular tempo
            ref_date = pd.to_datetime(df.at[idx, "data_batismo"])
            df.at[idx, "tempo"] = int(ANO_ATUAL - ref_date.year)
        df.at[idx, "genero"] = "M"

    elif cargo == "servo_ministerial":
        if df.at[idx, "idade"] < 16:
            df.at[idx, "idade"] = random.randint(16, 80)
            nascimento = datetime(ANO_ATUAL - df.at[idx, "idade"], random.randint(1, 12), random.randint(1, 28))
            df.at[idx, "data_nascimento"] = nascimento.strftime("%Y-%m-%d")
        if anos_batismo < 2:
            df.at[idx, "data_batismo"] = datetime(ANO_ATUAL - 2, random.randint(1, 12), random.randint(1, 28)).strftime("%Y-%m-%d")
            df.at[idx, "data_de_matricula"] = df.at[idx, "data_batismo"]
            ref_date = pd.to_datetime(df.at[idx, "data_batismo"])
            df.at[idx, "tempo"] = int(ANO_ATUAL - ref_date.year)
        df.at[idx, "genero"] = "M"

    elif cargo in ("pioneiro_regular", "pioneira_regular"):
        if anos_batismo < 1:
            df.at[idx, "data_batismo"] = datetime(ANO_ATUAL - 1, random.randint(1, 12), random.randint(1, 28)).strftime("%Y-%m-%d")
            df.at[idx, "data_de_matricula"] = df.at[idx, "data_batismo"]
            ref_date = pd.to_datetime(df.at[idx, "data_batismo"])
            df.at[idx, "tempo"] = int(ANO_ATUAL - ref_date.year)

    # 🔹 Gênero compatível com cargo (ajustar cargo se necessário)
    genero = str(df.at[idx, "genero"]).upper()
    cargos_masculinos = ["anciao", "servo_ministerial", "pioneiro_regular", "publicador_batizado", "publicador_nao_batizado", "estudante_novo"]
    cargos_femininos = ["pioneira_regular", "publicadora_batizada", "publicadora_nao_batizada", "estudante_nova"]
    if genero == "F" and cargo.lower() not in [c.lower() for c in cargos_femininos]:
        df.at[idx, "cargo"] = random.choice(cargos_femininos)
    elif genero == "M" and cargo.lower() not in [c.lower() for c in cargos_masculinos]:
        df.at[idx, "cargo"] = random.choice(cargos_masculinos)

    # 🔹 Estado civil = solteiro se menor
    if df.at[idx, "idade"] < 18:
        df.at[idx, "estado_civil"] = "solteiro"

    # 🔹 Participações (com override para tresures/gems)
    cargo_corrigido = str(df.at[idx, "cargo"]).strip().lower()
    if cargo_corrigido in regras_participacoes:
        for col, val in zip(particip_cols, regras_participacoes[cargo_corrigido]):
            if col in ["tresures", "gems"] and cargo_corrigido not in ["anciao", "servo_ministerial"]:
                df.at[idx, col] = False
            else:
                df.at[idx, col] = bool(val)

# 📌 Ajuste pais/filhos (mínimo 16 anos de diferença) - rodar após todas as idades
for idx, row in df.iterrows():
    if pd.notna(row["id_pai"]) and str(row["id_pai"]).strip() != "":
        pai_mask = df["user_id"] == row["id_pai"]
        if pai_mask.any():
            pai_idx = df[pai_mask].index[0]
            idade_pai = int(df.at[pai_idx, "idade"])
            if idade_pai - int(row["idade"]) < 16:
                df.at[pai_idx, "idade"] = int(row["idade"]) + random.randint(16, 30)
                # Recalcular nascimento do pai
                nascimento_pai = datetime(ANO_ATUAL - df.at[pai_idx, "idade"], random.randint(1, 12), random.randint(1, 28))
                df.at[pai_idx, "data_nascimento"] = nascimento_pai.strftime("%Y-%m-%d")
    if pd.notna(row["id_mae"]) and str(row["id_mae"]).strip() != "":
        mae_mask = df["user_id"] == row["id_mae"]
        if mae_mask.any():
            mae_idx = df[mae_mask].index[0]
            idade_mae = int(df.at[mae_idx, "idade"])
            if idade_mae - int(row["idade"]) < 16:
                df.at[mae_idx, "idade"] = int(row["idade"]) + random.randint(16, 30)
                nascimento_mae = datetime(ANO_ATUAL - df.at[mae_idx, "idade"], random.randint(1, 12), random.randint(1, 28))
                df.at[mae_idx, "data_nascimento"] = nascimento_mae.strftime("%Y-%m-%d")

# Preencher colunas opcionais se vazias
for idx in df.index:
    if pd.isna(df.at[idx, "email"]):
        nome = str(df.at[idx, "nome"]).split()[0].lower()
        df.at[idx, "email"] = fake_email(nome)
    if pd.isna(df.at[idx, "telefone"]):
        df.at[idx, "telefone"] = fake_phone()
    if pd.isna(df.at[idx, "ativo"]):
        df.at[idx, "ativo"] = True
    if pd.isna(df.at[idx, "observacoes"]):
        df.at[idx, "observacoes"] = ""
    if pd.isna(df.at[idx, "created_at"]):
        df.at[idx, "created_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    if pd.isna(df.at[idx, "updated_at"]):
        df.at[idx, "updated_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    if pd.isna(df.at[idx, "estado_civil"]):
        df.at[idx, "estado_civil"] = random.choice(["solteiro", "casado", "viúvo"])
    if pd.isna(df.at[idx, "papel_familiar"]):
        df.at[idx, "papel_familiar"] = random.choice(["pai", "mãe", "filho", "filha", "avo"])
    if pd.isna(df.at[idx, "id_pai"]):
        df.at[idx, "id_pai"] = ""
    if pd.isna(df.at[idx, "id_mae"]):
        df.at[idx, "id_mae"] = ""
    if pd.isna(df.at[idx, "id_conjuge"]):
        df.at[idx, "id_conjuge"] = ""
    if pd.isna(df.at[idx, "coabitacao"]):
        df.at[idx, "coabitacao"] = random.choice([True, False])
    if pd.isna(df.at[idx, "family_id"]):
        df.at[idx, "family_id"] = str(uuid.uuid4())
    if pd.isna(df.at[idx, "user_id"]):
        df.at[idx, "user_id"] = str(uuid.uuid4())

# 📌 Função de validação automática
def validar_dados(df):
    erros = {}
    warnings = {}
    total = len(df)
    
    # Erros críticos
    invalid_nome = df["nome"].str.strip().str.len() < 2
    erros["Nomes inválidos (<2 chars)"] = invalid_nome.sum()
    
    invalid_idade = (df["idade"] < 1) | (df["idade"] > 120)
    erros["Idades inválidas"] = invalid_idade.sum()
    
    invalid_genero = ~df["genero"].isin(["M", "F"])
    erros["Gêneros inválidos"] = invalid_genero.sum()
    
    invalid_familia = df["familia"].str.strip() == ""
    erros["Famílias vazias"] = invalid_familia.sum()
    
    # Batismo obrigatório para batizados
    batizados_sem_batismo = df[(df["cargo"].str.lower().isin(["anciao", "servo_ministerial", "pioneiro_regular", "pioneira_regular", "publicador_batizado", "publicadora_batizada"])) & (df["data_batismo"].isna())]
    erros["Batizados sem data_batismo"] = len(batizados_sem_batismo)
    
    # Matrícula obrigatória para não batizados
    nao_batizados_sem_matricula = df[(df["cargo"].str.lower().isin(["estudante_novo", "estudante_nova", "publicador_nao_batizado", "publicadora_nao_batizada"])) & (df["data_de_matricula"].isna())]
    erros["Não batizados sem data_de_matricula"] = len(nao_batizados_sem_matricula)
    
    # Menores sem responsável primário
    menores_sem_resp = df[(df["menor"] == True) & (df["responsavel_primario"].str.strip() == "")]
    erros["Menores sem responsável primário"] = len(menores_sem_resp)
    
    # Menores com estado_civil != solteiro
    menores_errado_civil = df[(df["menor"] == True) & (df["estado_civil"] != "solteiro")]
    warnings["Menores com estado_civil != solteiro"] = len(menores_errado_civil)
    
    # Ancião sem requisitos
    ancião_invalido = df[(df["cargo"].str.lower() == "anciao") & ((df["idade"] < 21) | (df["tempo"] < 4))]
    erros["Anciãos sem requisitos (idade<21 ou tempo<4)"] = len(ancião_invalido)
    
    # Servo sem requisitos
    servo_invalido = df[(df["cargo"].str.lower() == "servo_ministerial") & ((df["idade"] < 16) | (df["tempo"] < 2))]
    erros["Servos sem requisitos (idade<16 ou tempo<2)"] = len(servo_invalido)
    
    # Pioneiro sem tempo >=1
    pioneiro_invalido = df[df["cargo"].str.lower().isin(["pioneiro_regular", "pioneira_regular"]) & (df["tempo"] < 1)]
    erros["Pioneiros sem tempo >=1"] = len(pioneiro_invalido)
    
    # Gênero incompatível com cargo
    cargos_masc = ["anciao", "servo_ministerial", "pioneiro_regular", "publicador_batizado", "publicador_nao_batizado", "estudante_novo"]
    cargos_fem = ["pioneira_regular", "publicadora_batizada", "publicadora_nao_batizada", "estudante_nova"]
    genero_incomp_masc = df[(df["cargo"].str.lower().isin(cargos_masc)) & (df["genero"] == "F")]
    genero_incomp_fem = df[(df["cargo"].str.lower().isin(cargos_fem)) & (df["genero"] == "M")]
    erros["Gênero incompatível com cargo"] = len(genero_incomp_masc) + len(genero_incomp_fem)
    
    # Tresures/gems só para ancião/servo
    invalid_tresures = df[(df["tresures"] == True) & (~df["cargo"].str.lower().isin(["anciao", "servo_ministerial"]))]
    invalid_gems = df[(df["gems"] == True) & (~df["cargo"].str.lower().isin(["anciao", "servo_ministerial"]))]
    erros["Tresures inválido"] = len(invalid_tresures)
    erros["Gems inválido"] = len(invalid_gems)
    
    # Relatório
    total_erros = sum(erros.values())
    print("\n🔍 RELATÓRIO DE VALIDAÇÃO:")
    print(f"Total de registros: {total}")
    print(f"Total de erros críticos: {total_erros} ({total_erros/total*100:.1f}%)")
    if total_erros > 0:
        print("❌ ERROS ENCONTRADOS:")
        for k, v in erros.items():
            if v > 0:
                print(f"  - {k}: {v}")
                # Exemplo de 1 registro com erro (adaptado para nomes)
                if "Nomes" in k and invalid_nome.any():
                    ex_idx = df[invalid_nome].index[0]
                    exemplo = df.at[ex_idx, "nome"]
                    print(f"    Exemplo: Linha {ex_idx + 2} - '{exemplo}'")
                elif "Batizados sem data_batismo" in k and len(batizados_sem_batismo) > 0:
                    ex_idx = batizados_sem_batismo.index[0]
                    print(f"    Exemplo: Linha {ex_idx + 2} - Cargo: {df.at[ex_idx, 'cargo']}")
    else:
        print("✅ Nenhum erro crítico!")
    
    total_warnings = sum(warnings.values())
    if total_warnings > 0:
        print(f"\n⚠️ AVISOS: {total_warnings}")
        for k, v in warnings.items():
            if v > 0:
                print(f"  - {k}: {v}")
    
    if total_erros / total > 0.05:  # >5% erros, avisa
        print(f"\n🚨 Mais de 5% de erros! Verifique antes de salvar.")
        response = input("Salvar mesmo assim? (s/n): ")
        salvar = response.lower() == 's'
    else:
        salvar = True
    
    return salvar

# 📌 Reordenar colunas
df = df[colunas_necessarias]

# 🧪 Rodar validação antes de salvar
salvar = validar_dados(df)

if salvar:
    df.to_excel(output_file, index=False)
    print(f"\n✅ Planilha corrigida salva em: {output_file}")
else:
    print("❌ Salvamento cancelado. Execute novamente após ajustes manuais.")