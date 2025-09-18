import axios from 'axios';

async function testEstudantes() {
  try {
    // First, get the list of congregations
    const congregacoesResponse = await axios.get('http://localhost:3001/api/congregacoes');
    console.log('Congregações:', congregacoesResponse.data);
    
    if (congregacoesResponse.data.success && congregacoesResponse.data.congregacoes.length > 0) {
      const congregacaoId = congregacoesResponse.data.congregacoes[0].id;
      console.log('Using congregacao_id:', congregacaoId);
      
      // Now test the students endpoint
      const estudantesResponse = await axios.get(`http://localhost:3001/api/estudantes?congregacao_id=${congregacaoId}`);
      console.log('Estudantes Response:', estudantesResponse.data);
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testEstudantes();