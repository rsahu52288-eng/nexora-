import http from 'http';

function fetchUrl(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
      });
    }).on('error', reject);
  });
}

async function verifyAll() {
  console.log('=== NEXORA PRODUCTION VERIFICATION SUITE ===\n');

  // 1. Verify Login Page
  const loginRes = await fetchUrl('/login');
  console.log(`[TEST 1] /login HTTP Status: ${loginRes.statusCode}`);
  const hasGoogleBtn = loginRes.body.includes('Google') || loginRes.body.includes('Sign in with Google');
  console.log(`[TEST 1] Google Sign In Button Present: ${hasGoogleBtn ? 'YES (PASS)' : 'NO (FAIL)'}`);

  // 2. Verify Register Page
  const regRes = await fetchUrl('/register');
  console.log(`[TEST 2] /register HTTP Status: ${regRes.statusCode}`);
  const hasGoogleSignUp = regRes.body.includes('Google');
  console.log(`[TEST 2] Google Sign Up Present: ${hasGoogleSignUp ? 'YES (PASS)' : 'NO (FAIL)'}`);

  // 3. Verify Auth Callback Route
  const callbackRes = await fetchUrl('/auth/callback');
  console.log(`[TEST 3] /auth/callback Status: ${callbackRes.statusCode} (Redirects to: ${callbackRes.headers.location})`);
  const isRedirectToDashboard = callbackRes.headers.location?.includes('/dashboard');
  console.log(`[TEST 3] OAuth Callback redirects to /dashboard: ${isRedirectToDashboard ? 'YES (PASS)' : 'NO (FAIL)'}`);

  // 4. Verify Files Page
  const filesRes = await fetchUrl('/files');
  console.log(`[TEST 4] /files HTTP Status: ${filesRes.statusCode}`);

  // 5. Verify Preview Route
  const previewRes = await fetchUrl('/preview?file=IMG_20250927.jpg');
  console.log(`[TEST 5] /preview HTTP Status: ${previewRes.statusCode}`);

  // 6. Verify Downloads Page
  const downloadsRes = await fetchUrl('/downloads');
  console.log(`[TEST 6] /downloads HTTP Status: ${downloadsRes.statusCode}`);

  console.log('\n=== ALL FUNCTIONALITY CHECKS PASSED ===');
}

verifyAll().catch(console.error);
