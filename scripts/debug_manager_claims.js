
import admin from 'firebase-admin';

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

admin.initializeApp({
    projectId: 'demo-gamut-claims',
});

const db = admin.firestore();
const auth = admin.auth();

async function debugManagerClaims() {
    try {
        const managerEmail = 'manager2@gamut.com';
        console.log(`\n🔍 Debugging for: ${managerEmail}`);

        // 1. Check Auth User & Claims
        let userRecord;
        try {
            userRecord = await auth.getUserByEmail(managerEmail);
        } catch (e) {
            console.error('❌ Could not find user in Auth:', e.message);
            return;
        }

        console.log(`\n👤 Auth User:`);
        console.log(`- UID: ${userRecord.uid}`);
        console.log(`- Custom Claims:`, userRecord.customClaims);

        const authTeamId = userRecord.customClaims?.teamId;

        // 2. Check Firestore User Doc
        const userDoc = await db.collection('users').doc(userRecord.uid).get();
        console.log(`\n📄 Firestore User Doc:`);
        if (!userDoc.exists) {
            console.error('❌ User document missing in Firestore!');
            return;
        }
        const userData = userDoc.data();
        console.log(`- Role: ${userData.role}`);
        console.log(`- Team ID: ${userData.teamId}`);
        console.log(`- Organization ID: ${userData.organizationId}`);

        // 3. Verify Team ID Consistency
        if (authTeamId !== userData.teamId) {
            console.error(`\n⚠️ MATCH WARNING: Auth TeamID (${authTeamId}) != Firestore TeamID (${userData.teamId})`);
            console.log('   (This means the custom claims on the token are outdated compared to Firestore)');
        } else {
            console.log(`\n✅ Team IDs match (${authTeamId})`);
        }

        const targetTeamId = userData.teamId;

        // 4. Query Claims (Mimicking Frontend Logic)
        console.log(`\n🔎 Querying Claims for Team: ${targetTeamId}`);

        // Simple query first
        const simpleQuery = await db.collection('claims')
            .where('teamId', '==', targetTeamId)
            .get();

        console.log(`- Simple Query (teamId only): Found ${simpleQuery.size} claims`);
        simpleQuery.forEach(doc => {
            console.log(`  > [${doc.id}] ${doc.data().title} (Status: ${doc.data().status})`);
        });

        // Complex query (Frontend uses this: teamId + updatedAt desc)
        try {
            const complexQuery = await db.collection('claims')
                .where('teamId', '==', targetTeamId)
                .orderBy('updatedAt', 'desc')
                .get();
            console.log(`- Complex Query (teamId + order): Found ${complexQuery.size} claims`);
        } catch (e) {
            console.error(`\n❌ Complex Query FAILED:`, e.details);
            // Note: e.details often has the index link if missing
        }

    } catch (e) {
        console.error('Debug Script Error:', e);
    }
}

debugManagerClaims();
