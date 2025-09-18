// Test script for Designacoes page functionality
const testDesignacoesPage = async () => {
    console.log('🧪 Testing Designacoes Page...');
    
    const baseUrl = 'http://localhost:8080';
    const apiUrl = 'http://localhost:3001';
    
    // Test 1: Check if frontend is accessible
    try {
        const response = await fetch(`${baseUrl}/`);
        console.log('✅ Frontend accessible:', response.status === 200);
    } catch (error) {
        console.error('❌ Frontend not accessible:', error.message);
        return;
    }
    
    // Test 2: Check if backend API is accessible
    try {
        const response = await fetch(`${apiUrl}/api/health`);
        const data = await response.json();
        console.log('✅ Backend API accessible:', data);
    } catch (error) {
        console.error('❌ Backend API not accessible:', error.message);
    }
    
    // Test 3: Check specific routes
    const routes = [
        '/auth',
        '/dashboard', 
        '/designacoes',
        '/estudantes',
        '/programas'
    ];
    
    for (const route of routes) {
        try {
            const response = await fetch(`${baseUrl}${route}`);
            console.log(`✅ Route ${route}:`, response.status === 200 ? 'OK' : `Status ${response.status}`);
        } catch (error) {
            console.error(`❌ Route ${route}:`, error.message);
        }
    }
    
    console.log('\n📋 Designacoes Page Test Results:');
    console.log('- URL: http://localhost:8080/designacoes');
    console.log('- Login: amazonwebber007@gmail.com / admin123');
    console.log('- Expected: Protected route requiring instrutor role');
    console.log('- Component: DesignacoesPage.tsx');
    
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Login at: http://localhost:8080/auth');
    console.log('2. Use credentials: amazonwebber007@gmail.com / admin123');
    console.log('3. Navigate to: http://localhost:8080/designacoes');
    console.log('4. Check browser console for errors');
};

// Run the test
testDesignacoesPage().catch(console.error);