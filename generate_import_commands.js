import fs from 'fs';

// Read the JSON file
const studentsData = JSON.parse(fs.readFileSync('estudantes_refinados_converted.json', 'utf8'));

console.log(`📊 Total de estudantes no arquivo: ${studentsData.length}`);

// Split into batches of 20 students to avoid size limits
const batchSize = 20;
const batches = [];

for (let i = 0; i < studentsData.length; i += batchSize) {
  batches.push(studentsData.slice(i, i + batchSize));
}

console.log(`📦 Número de lotes: ${batches.length}`);
console.log(`📋 Tamanho de cada lote: ${batchSize}`);

// Generate SQL commands for each batch
console.log('\n-- Comandos SQL para importar os estudantes em lotes:');
batches.forEach((batch, index) => {
  const jsonString = JSON.stringify(batch);
  console.log(`\n-- Lote ${index + 1}/${batches.length} (${batch.length} estudantes)`);
  console.log(`SELECT * FROM process_estudantes_batch('${jsonString}'::JSONB);`);
});

console.log('\n✅ Comandos SQL gerados!');
console.log('💡 Execute cada comando no Supabase para importar os estudantes.');