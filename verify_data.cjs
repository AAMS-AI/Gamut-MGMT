
const admin = require('firebase-admin');

// Connect to emulators
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

admin.initializeApp({ projectId: 'demo-gamut-claims' });
const db = admin.firestore();

async function checkData() {
    console.log("Checking Data Integrity...");

    // 1. Check Team 2
    const teamDoc = await db.collection('teams').doc('team2').get();
    console.log("Team 2 Exists:", teamDoc.exists);
    if (teamDoc.exists) console.log("Team 2 Data:", teamDoc.data());

    // 2. Check Users in Team 2
    const usersSnap = await db.collection('users').where('teamId', '==', 'team2').get();
    console.log("Users in Team 2 (Count):", usersSnap.size);
    usersSnap.forEach(doc => {
        console.log(` - User: ${doc.data().email}, Role: ${doc.data().role}, TeamId: ${doc.data().teamId}`);
    });

}

checkData();
