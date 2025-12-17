#!/usr/bin/env node

/**
 * Seed script for Firebase Emulator
 * Uses Admin SDK to bypass security rules during seeding
 */

import admin from 'firebase-admin';

// Connect to emulators BEFORE initializing
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

// Initialize Firebase Admin SDK for emulator
admin.initializeApp({
    projectId: 'demo-gamut-claims',
});

const auth = admin.auth();
const db = admin.firestore();

console.log('🔥 Connected to Firebase Emulators (Admin SDK)');

// Mock data
const organization = {
    id: 'org1',
    name: 'Restoration Pro Services',
    address: '456 Restore Way, Springfield, IL',
    industry: 'Restoration',
    size: '11-50',
    createdAt: admin.firestore.Timestamp.now(),
    settings: {
        currency: 'USD',
        timezone: 'America/New_York',
    }
};

const teams = [
    { id: 'team1', name: 'General', organizationId: 'org1', specialty: 'Headquarters', memberCount: 2, description: 'Organization management and oversight.' },
    { id: 'team2', name: 'Team Alpha', organizationId: 'org1', specialty: 'Field Operations', memberCount: 2, description: 'Primary field response team.' },
];

const users = [
    // --- TEAM 1: General (HQ) ---
    {
        id: 'user1',
        email: 'owner@gamut.com',
        password: 'password123',
        displayName: 'Sarah Johnson',
        role: 'owner',
        organizationId: 'org1',
        teamId: 'team1',
        jobTitle: 'CEO',
        phoneNumber: '555-0101',
    },
    {
        id: 'user2',
        email: 'admin@gamut.com',
        password: 'password123',
        displayName: 'Bruce Wayne',
        role: 'admin',
        organizationId: 'org1',
        teamId: 'team1',
        jobTitle: 'Operations Director',
        phoneNumber: '555-0102',
    },

    // --- TEAM 2: Team Alpha ---
    {
        id: 'user3',
        email: 'manager@gamut.com',
        password: 'password123',
        displayName: 'Mike Chen',
        role: 'manager',
        organizationId: 'org1',
        teamId: 'team2',
        jobTitle: 'Team Lead',
        phoneNumber: '555-0103',
    },
    {
        id: 'user4',
        email: 'member@gamut.com',
        password: 'password123',
        displayName: 'Alex Rivera',
        role: 'member',
        organizationId: 'org1',
        teamId: 'team2',
        jobTitle: 'Technician',
        phoneNumber: '555-0104',
    },
];



async function clearCollection(collectionPath) {
    const batchSize = 100;
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(db, query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(db, query, resolve) {
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) {
        // When there are no documents left, we are done
        resolve();
        return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
        deleteQueryBatch(db, query, resolve);
    });
}

async function seedData() {
    try {
        console.log('📝 Starting seed process...\n');

        // Clear existing data
        console.log('🧹 Clearing existing data...');
        await clearCollection('users');
        await clearCollection('teams');
        await clearCollection('organizations');
        await clearCollection('comments');
        console.log('  ✓ Data cleared.');

        const userIdMap = {};

        // Create users
        console.log('\n👥 Creating users...');
        for (const user of users) {
            let firebaseUid;
            try {
                const userRecord = await auth.createUser({
                    email: user.email,
                    password: user.password,
                    displayName: user.displayName,
                });
                firebaseUid = userRecord.uid;
                console.log(`  ✓ Created auth user: ${user.email}`);

                if (user.role) {
                    await auth.setCustomUserClaims(firebaseUid, {
                        role: user.role,
                        organizationId: user.organizationId,
                        teamId: user.teamId,
                    });
                }

            } catch (error) {
                if (error.code === 'auth/email-already-exists') {
                    console.log(`  ⚠ User already exists: ${user.email}`);
                    try {
                        const existingUser = await auth.getUserByEmail(user.email);
                        firebaseUid = existingUser.uid;
                        if (user.role) {
                            await auth.setCustomUserClaims(firebaseUid, {
                                role: user.role,
                                organizationId: user.organizationId,
                                teamId: user.teamId,
                            });
                        }
                    } catch (fetchError) {
                        console.error(`  ✗ Error fetching existing user ${user.email}:`, fetchError.message);
                        continue;
                    }
                } else {
                    console.error(`  ✗ Error creating user ${user.email}:`, error.message);
                    continue;
                }
            }

            if (firebaseUid) {
                userIdMap[user.id] = firebaseUid;
                const { password, id, ...userData } = user;
                await db.collection('users').doc(firebaseUid).set({
                    ...userData,
                    createdAt: admin.firestore.Timestamp.now(),
                    updatedAt: admin.firestore.Timestamp.now(),
                }, { merge: true });
            }
        }

        // Create organization
        console.log('\n🏢 Creating organization...');
        const { id, ...orgFields } = organization;
        const orgData = {
            ...orgFields,
            ownerId: userIdMap['user1'] || 'user1',
            updatedAt: admin.firestore.Timestamp.now(),
        };
        await db.collection('organizations').doc(id).set(orgData);
        console.log(`  ✓ Created: ${organization.name}`);

        // Create teams
        console.log('\n👥 Creating teams...');
        for (const team of teams) {
            const { id, ...teamData } = team;
            const dataToSave = {
                ...teamData,
                createdAt: admin.firestore.Timestamp.now(),
                updatedAt: admin.firestore.Timestamp.now()
            };
            await db.collection('teams').doc(id).set(dataToSave);
            console.log(`  ✓ Created: ${team.name}`);
        }

        // Create claims
        // Create claims (Skipped)

        // Create comments
        // Create comments (Skipped)

        console.log('\n✅ Seed completed successfully!');

        console.log('\n🔥 Firebase Emulator UI: http://localhost:4000');
        console.log('\n📝 User Credentials (all passwords: password123 except noted):');
        users.forEach(u => {
            console.log(`  - ${u.displayName} (${u.role}): ${u.email}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Seed failed:', error);
        process.exit(1);
    }
}

seedData();
