/**
 * Generate VAPID Keys for Web Push Notifications
 * 
 * This script generates VAPID (Voluntary Application Server Identification) keys
 * required for Web Push notifications.
 * 
 * Usage:
 * node scripts/generate-vapid-keys.js
 * 
 * Or use the web-push CLI directly:
 * npx web-push generate-vapid-keys
 */

const webpush = require('web-push');

console.log('\n🔐 Generating VAPID Keys for Web Push Notifications...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ VAPID Keys Generated Successfully!\n');
console.log('═══════════════════════════════════════════════════════════════');
console.log('Add these to your .env.local file:');
console.log('═══════════════════════════════════════════════════════════════\n');
console.log('# Public key (safe to expose to client)');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}\n`);
console.log('# Private key (KEEP SECRET - server only)');
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}\n`);
console.log('# Contact email for VAPID');
console.log('VAPID_SUBJECT=mailto:admin@loveapp.com\n');
console.log('═══════════════════════════════════════════════════════════════\n');
console.log('⚠️  IMPORTANT SECURITY NOTES:');
console.log('   • NEVER commit .env.local to version control');
console.log('   • Keep the private key secret (server-side only)');
console.log('   • Public key can be safely exposed to client');
console.log('   • Use different keys for development and production');
console.log('═══════════════════════════════════════════════════════════════\n');

// Save to a temporary file (optional)
const fs = require('fs');
const envContent = `# VAPID Keys for Web Push Notifications
# Generated: ${new Date().toISOString()}
# DO NOT COMMIT THIS FILE

# Public key (safe to expose to client)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}

# Private key (KEEP SECRET - server only)
VAPID_PRIVATE_KEY=${vapidKeys.privateKey}

# Contact email for VAPID (required by Web Push spec)
VAPID_SUBJECT=mailto:admin@loveapp.com

# Appwrite Database Configuration
NEXT_PUBLIC_APPWRITE_DATABASE_ID=love-app-db
NEXT_PUBLIC_APPWRITE_PUSH_COLLECTION_ID=push_subscriptions
`;

try {
  fs.writeFileSync('.env.vapid.temp', envContent);
  console.log('📝 Keys saved to .env.vapid.temp (copy to .env.local and delete)');
  console.log('   Run: cp .env.vapid.temp .env.local && rm .env.vapid.temp\n');
} catch (err) {
  console.log('⚠️  Could not write to file, please copy keys manually\n');
}

console.log('Next Steps:');
console.log('1. Copy the environment variables above to your .env.local file');
console.log('2. Create Appwrite collection "push_subscriptions" (see PUSH_NOTIFICATIONS_SETUP.md)');
console.log('3. Install web-push: npm install web-push');
console.log('4. Test push notifications in your app\n');
