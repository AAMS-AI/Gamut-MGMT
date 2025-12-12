
const admin = require('firebase-admin');

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

admin.initializeApp({
    projectId: 'demo-gamut-claims',
});

const db = admin.firestore();
const auth = admin.auth();

async function checkData() {
    try {
        console.log('🔍 Checking data for manager2@gamut.com...');

        // 1. Get User
        const userPool = await auth.getUserByEmail('manager2@gamut.com');
        console.log(`\nUser (Auth): ${userPool.email} (${userPool.uid})`);
        console.log(`Custom Claims:`, userPool.customClaims);

        const userDoc = await db.collection('users').doc(userPool.uid).get();
        if (!userDoc.exists) {
            console.error('❌ User document DOES NOT exist in Firestore!');
        } else {
            console.log('✅ User document exists.');
            console.log('User Data:', userDoc.data());
        }

        const teamId = userDoc.data().teamId;
        if (!teamId) {
            console.error('❌ User has NO teamId!');
        } else {
            console.log(`Target Team ID: ${teamId}`);
        }

        // 2. Query Claims
        console.log(`\n🔍 Querying claims for teamId: ${teamId}...`);
        const claimsSnapshot = await db.collection('claims').where('teamId', '==', teamId).get();

        console.log(`Found ${claimsSnapshot.size} claims.`);
        claimsSnapshot.forEach(doc => {
            console.log(`- Claim ${doc.id}: ${doc.data().title} (Team: ${doc.data().teamId})`);
        });

        // 3. Check for specific problematic claim
        // Check if there are any claims that SHOULD match but don't?
        // No, verifying existence is enough.

    } catch (e) {
        console.error('Error:', e);
    }
}

checkData();
