// Script to clear Supabase cache and auth data from localStorage
console.log('🧹 Clearing Supabase cache and auth data...');

// Clear all Supabase-related items from localStorage
const supabaseKeys = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (key.includes('supabase') || key.includes('auth'))) {
    supabaseKeys.push(key);
  }
}

console.log('Found Supabase keys:', supabaseKeys);

supabaseKeys.forEach(key => {
  console.log('Removing:', key);
  localStorage.removeItem(key);
});

// Clear all Supabase-related items from sessionStorage
const sessionSupabaseKeys = [];
for (let i = 0; i < sessionStorage.length; i++) {
  const key = sessionStorage.key(i);
  if (key && (key.includes('supabase') || key.includes('auth'))) {
    sessionSupabaseKeys.push(key);
  }
}

console.log('Found session Supabase keys:', sessionSupabaseKeys);

sessionSupabaseKeys.forEach(key => {
  console.log('Removing from session:', key);
  sessionStorage.removeItem(key);
});

console.log('✅ Supabase cache cleared successfully!');

// Also clear any service worker caches
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.unregister().then(() => {
        console.log('Unregistered service worker:', registration.scope);
      });
    });
  });
}

console.log('💡 Please refresh the page to apply changes');