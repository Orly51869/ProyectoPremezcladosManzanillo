const fs = require('fs');
const path = require('path');
const https = require('https');

// Path to Frontend .env
const envPath = path.join(__dirname, '..', 'PremezcladosManzanillo', 'Frontend', '.env');
const authProviderPath = path.join(__dirname, '..', 'PremezcladosManzanillo', 'Frontend', 'src', 'components', 'Auth0ProviderWithNavigate.jsx');

console.log('--- Verifying Auth0 Configuration ---\n');

// 1. Read .env file
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const domainMatch = envContent.match(/VITE_REACT_APP_AUTH0_DOMAIN=(.*)/);
    const clientIdMatch = envContent.match(/VITE_REACT_APP_AUTH0_CLIENT_ID=(.*)/);

    const domain = domainMatch ? domainMatch[1].trim() : null;
    const clientId = clientIdMatch ? clientIdMatch[1].trim() : null;

    if (domain && clientId) {
        console.log('✅ Found local .env configuration:');
        console.log(`   Domain: ${domain}`);
        console.log(`   Client ID: ${clientId}`);

        // precise warning about Netlify
        console.log('\n⚠️  IMPORTANT: Netlify does NOT read .env files automatically.');
        console.log('   You MUST go to Netlify > Site settings > Build & deploy > Environment variables');
        console.log('   and add these EXACT keys and values:');
        console.log(`     - VITE_REACT_APP_AUTH0_DOMAIN: ${domain}`);
        console.log(`     - VITE_REACT_APP_AUTH0_CLIENT_ID: ${clientId}`);
    } else {
        console.log('❌ Could not find Auth0 variables in .env file.');
    }
} else {
    console.log('❌ .env file not found at:', envPath);
}

// 2. Check hardcoded Audience
if (fs.existsSync(authProviderPath)) {
    const providerContent = fs.readFileSync(authProviderPath, 'utf8');
    const audienceMatch = providerContent.match(/audience:\s*["']([^"']+)["']/);

    if (audienceMatch) {
        const audience = audienceMatch[1];
        console.log(`\n✅ Found hardcoded Audience in code: "${audience}"`);
        console.log('   Make sure verify checking that an API with this Identifier exists in your NEW Auth0 Tenant!');
        console.log('   It should be under Applications > APIs > Create API (Identifier: https://premezclados-api.com)');
    } else {
        console.log('\n⚠️  Could not find explicit audience configuration in Auth0ProviderWithNavigate.jsx');
    }
}

// 3. Callback URL Warning
console.log('\nℹ️  Callback URLs Check:');
console.log('   In your Auth0 Dashboard > Applications > Your App > Settings:');
console.log('   Ensure you have added your Netlify URL to:');
console.log('     - Allowed Callback URLs (e.g., https://your-site.netlify.app)');
console.log('     - Allowed Logout URLs (e.g., https://your-site.netlify.app)');
console.log('     - Allowed Web Origins (e.g., https://your-site.netlify.app)');

console.log('\n--- End of Verification ---');
