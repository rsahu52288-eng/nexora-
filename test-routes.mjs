const routes = [
  '/',
  '/dashboard',
  '/upload',
  '/files',
  '/shared',
  '/analytics',
  '/activity',
  '/notifications',
  '/settings',
  '/admin',
  '/login',
  '/register',
  '/preview',
  '/downloads',
];

async function checkRoutes() {
  console.log('Testing NEXORA route availability...');
  let successCount = 0;

  for (const route of routes) {
    try {
      const res = await fetch(`http://localhost:3000${route}`);
      const text = await res.text();
      if (res.status === 200 && text.length > 500) {
        console.log(`[PASS] ${route} -> Status: 200, Length: ${text.length} bytes`);
        successCount++;
      } else {
        console.error(`[FAIL] ${route} -> Status: ${res.status}`);
      }
    } catch (err) {
      console.error(`[ERROR] ${route} -> ${err.message}`);
    }
  }

  console.log(`\nResult: ${successCount} of ${routes.length} routes passed perfectly!`);
}

checkRoutes();
