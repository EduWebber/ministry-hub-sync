// Test S-38 Algorithm API
import fetch from 'node-fetch';

async function testS38Algorithm() {
  try {
    console.log('🧪 Testing S-38 Algorithm API...');
    
    const response = await fetch('http://localhost:3001/api/designacoes/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        programacao_id: '2026-01-05',
        congregacao_id: '7e90ac8e-d2f4-403a-b78f-55ff20ab7edf'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    console.log('\n✅ S-38 Algorithm Test Results:');
    console.log('=====================================');
    console.log(`Message: ${result.message}`);
    console.log(`Algorithm: ${result.algorithm || 'Not specified'}`);
    console.log(`Success: ${result.success}`);
    
    if (result.summary) {
      console.log('\n📊 Summary:');
      console.log(`  Total Items: ${result.summary.total_itens}`);
      console.log(`  Assignments OK: ${result.summary.designacoes_ok}`);
      console.log(`  Pending: ${result.summary.designacoes_pendentes}`);
      console.log(`  Fallbacks Applied: ${result.summary.fallbacks_applied || 0}`);
    }
    
    if (result.designacoes && result.designacoes.length > 0) {
      console.log('\n🎯 Generated Assignments:');
      result.designacoes.forEach((assignment, index) => {
        console.log(`  ${index + 1}. Item ID: ${assignment.programacao_item_id}`);
        console.log(`     Principal: ${assignment.principal_estudante_id || 'None'}`);
        console.log(`     Assistant: ${assignment.assistente_estudante_id || 'None'}`);
        console.log(`     Status: ${assignment.status}`);
        if (assignment.observacoes) {
          console.log(`     Notes: ${assignment.observacoes}`);
        }
        console.log('');
      });
    }
    
    console.log('🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testS38Algorithm();