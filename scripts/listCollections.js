#!/usr/bin/env node

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
    projectId: "demo-gamut-claims",
});

const db = getFirestore(app);
connectFirestoreEmulator(db, 'localhost', 8080);

async function listCollections() {
    const collections = ['users', 'organizations', 'teams'];

    console.log('📊 Firestore Collections:\n');

    for (const collectionName of collections) {
        try {
            const snapshot = await getDocs(collection(db, collectionName));
            console.log(`✅ ${collectionName}: ${snapshot.size} documents`);
            snapshot.forEach(doc => {
                console.log(`   - ${doc.id}`);
            });
            console.log('');
        } catch (error) {
            console.log(`❌ ${collectionName}: Error - ${error.message}\n`);
        }
    }
}

listCollections().then(() => process.exit(0));
