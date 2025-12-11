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
    { id: 'team1', name: 'General', organizationId: 'org1', specialty: 'General Operations', memberCount: 2, description: 'Administrative and HQ operations center.' }, // Owner + BG
    { id: 'team2', name: 'Water Damage Team', organizationId: 'org1', specialty: 'Water Damage', memberCount: 2, description: 'Specializes in rapid response for water damage mitigation.' }, // Mike + Alex
    { id: 'team3', name: 'Fire Restoration Team', organizationId: 'org1', specialty: 'Fire Restoration', memberCount: 3, description: 'Experts in fire and smoke damage restoration.' }, // Lisa + Emily + Tom
];

const users = [
    // --- TEAM 1: General (Admin/HQ) ---
    {
        id: 'user1',
        email: 'owner@gamut.com',
        password: 'owner123',
        displayName: 'Sarah Johnson',
        role: 'org_owner',
        organizationId: 'org1',
        teamId: 'team1',
        jobTitle: 'CEO',
        phoneNumber: '555-0101',
    },
    {
        id: 'user2',
        email: 'manager1@gamut.com', // Keeping email consistent for ease, but name/role changes
        password: 'manager123',
        displayName: 'Bruce Wayne',
        role: 'manager',
        organizationId: 'org1',
        teamId: 'team1',
        jobTitle: 'General Manager',
        phoneNumber: '555-0102',
    },

    // --- TEAM 2: Water (Ops) ---
    {
        id: 'user3',
        email: 'manager2@gamut.com',
        password: 'manager123',
        displayName: 'Mike Chen',
        role: 'manager',
        organizationId: 'org1',
        teamId: 'team2',
        jobTitle: 'Water Ops Manager',
        phoneNumber: '555-0103',
    },
    {
        id: 'user4',
        email: 'member1@gamut.com',
        password: 'member123',
        displayName: 'Alex Rivera',
        role: 'team_member',
        organizationId: 'org1',
        teamId: 'team2',
        jobTitle: 'Water Technician',
        phoneNumber: '555-0104',
    },

    // --- TEAM 3: Fire (Ops) ---
    {
        id: 'user5',
        email: 'manager3@gamut.com',
        password: 'manager123',
        displayName: 'Lisa Rodriguez',
        role: 'manager',
        organizationId: 'org1',
        teamId: 'team3',
        jobTitle: 'Fire Ops Manager',
        phoneNumber: '555-0105',
    },
    {
        id: 'user6',
        email: 'member2@gamut.com',
        password: 'member123',
        displayName: 'Emily Blunt',
        role: 'team_member',
        organizationId: 'org1',
        teamId: 'team3',
        jobTitle: 'Fire Lead',
        phoneNumber: '555-0106',
    },
    {
        id: 'user7',
        email: 'member3@gamut.com',
        password: 'member123',
        displayName: 'Tom Hardy',
        role: 'team_member',
        organizationId: 'org1',
        teamId: 'team3',
        jobTitle: 'Fire Technician',
        phoneNumber: '555-0107',
    },
];

const claims = [
    // Water Claims (Team 2)
    {
        id: 'claim1',
        claimNumber: 'CLM-2024-001',
        title: 'Water Damage - Kitchen Flood',
        description: 'Extensive water damage in kitchen due to burst pipe.',
        amount: 15750,
        status: 'pending_review',
        teamId: 'team2',
        submittedBy: 'user4', // Alex (Member)
        submittedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-15')),
        updatedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-15')),
        propertyType: 'Residential',
        metadata: { address: '123 Main St', incidentDate: '2024-01-10' },
        lineItems: []
    },
    {
        id: 'claim2',
        claimNumber: 'CLM-2024-002',
        title: 'Water Damage - Bathroom',
        description: 'Bathroom flood from toilet overflow.',
        amount: 9800,
        status: 'approved',
        teamId: 'team2', // Water
        submittedBy: 'user3', // Mike (Manager)
        submittedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-20')),
        updatedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-21')),
        propertyType: 'Residential',
        metadata: { address: '555 Maple Dr', incidentDate: '2024-01-18', approvedBy: 'user1' },
        lineItems: []
    },
    // Fire Claims (Team 3)
    {
        id: 'claim3',
        claimNumber: 'CLM-2024-003',
        title: 'Fire Damage - Living Room',
        description: 'Fire damage from electrical fault.',
        amount: 28500,
        status: 'sent_to_insurance',
        teamId: 'team3',
        submittedBy: 'user6', // Emily (Member)
        submittedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-12')),
        updatedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-14')),
        propertyType: 'Residential',
        metadata: { address: '456 Oak Ave', incidentDate: '2024-01-08' },
        lineItems: []
    }
];

const comments = [
    {
        id: 'comment1',
        claimId: 'claim1',
        userId: 'user3', // Mike
        text: 'Scheduling site visit for tomorrow.',
        createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-16')),
    }
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
        await clearCollection('claims');
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
                    await auth.setCustomUserClaims(firebaseUid, { role: user.role, organizationId: user.organizationId, teamId: user.teamId });
                }

            } catch (error) {
                if (error.code === 'auth/email-already-exists') {
                    console.log(`  ⚠ User already exists: ${user.email}`);
                    try {
                        const existingUser = await auth.getUserByEmail(user.email);
                        firebaseUid = existingUser.uid;
                        if (user.role) {
                            await auth.setCustomUserClaims(firebaseUid, { role: user.role, organizationId: user.organizationId, teamId: user.teamId });
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
        console.log('\n📋 Creating claims...');
        for (const claim of claims) {
            const claimData = {
                ...claim,
                organizationId: 'org1',
                submittedBy: userIdMap[claim.submittedBy] || claim.submittedBy,
            };
            if (claimData.metadata?.approvedBy) claimData.metadata.approvedBy = userIdMap[claimData.metadata.approvedBy] || claimData.metadata.approvedBy;

            await db.collection('claims').doc(claim.id).set(claimData);
            console.log(`  ✓ Created: ${claim.claimNumber}`);
        }

        // Create comments
        console.log('\n💬 Creating comments...');
        for (const comment of comments) {
            const commentData = {
                ...comment,
                userId: userIdMap[comment.userId] || comment.userId,
            };
            await db.collection('comments').doc(comment.id).set(commentData);
        }

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
