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
    createdAt: admin.firestore.Timestamp.now(),
    settings: {
        currency: 'USD',
        timezone: 'America/New_York',
    }
};

const teams = [
    { id: 'team1', name: 'Water Damage Team', organizationId: 'org1', specialty: 'Water Damage', memberCount: 8 },
    { id: 'team2', name: 'Fire Restoration Team', organizationId: 'org1', specialty: 'Fire Restoration', memberCount: 6 },
    { id: 'team3', name: 'Mold Remediation Team', organizationId: 'org1', specialty: 'Mold Remediation', memberCount: 5 },
    { id: 'team4', name: 'Storm Damage Team', organizationId: 'org1', specialty: 'Storm Damage', memberCount: 7 },
    { id: 'team5', name: 'General Restoration', organizationId: 'org1', specialty: 'General Restoration', memberCount: 10 },
];

const users = [
    {
        id: 'user1',
        email: 'owner@gamut.com',
        password: 'owner123',
        name: 'Sarah Johnson',
        role: 'org_owner',
        organizationId: 'org1',
        teamId: null,
        hasAdminRights: true,
    },
    {
        id: 'user2',
        email: 'manager1@gamut.com',
        password: 'manager123',
        name: 'Mike Chen',
        role: 'manager',
        organizationId: 'org1',
        teamId: 'team1',
        hasAdminRights: false,
    },
    {
        id: 'user3',
        email: 'manager2@gamut.com',
        password: 'manager123',
        name: 'Lisa Rodriguez',
        role: 'manager',
        organizationId: 'org1',
        teamId: 'team2',
        hasAdminRights: true,
    },
    {
        id: 'user4',
        email: 'member@gamut.com',
        password: 'member123',
        name: 'Alex Rivera',
        role: 'team_member',
        organizationId: 'org1',
        teamId: 'team1',
        hasAdminRights: false,
    },
];

const claims = [
    {
        id: 'claim1',
        claimNumber: 'CLM-2024-001',
        title: 'Water Damage - Kitchen Flood',
        description: 'Extensive water damage in kitchen due to burst pipe. Requires immediate attention.',
        amount: 15750,
        status: 'pending_review',
        teamId: 'team1',
        submittedBy: 'user4',
        submittedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-15')),
        updatedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-15')),
        propertyType: 'Residential',
        attachments: [
            'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
            'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800',
        ],
        metadata: {
            address: '123 Main St, Springfield',
            incidentDate: '2024-01-10',
        }
    },
    {
        id: 'claim2',
        claimNumber: 'CLM-2024-002',
        title: 'Fire Damage - Living Room',
        description: 'Fire damage from electrical fault. Smoke damage throughout first floor.',
        amount: 28500,
        status: 'approved',
        teamId: 'team2',
        submittedBy: 'user3',
        submittedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-12')),
        updatedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-14')),
        propertyType: 'Residential',
        attachments: [
            'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800',
        ],
        metadata: {
            address: '456 Oak Ave, Springfield',
            incidentDate: '2024-01-08',
            approvedBy: 'user1',
            approvedAt: '2024-01-14',
        }
    },
    {
        id: 'claim3',
        claimNumber: 'CLM-2024-003',
        title: 'Mold Remediation - Basement',
        description: 'Extensive mold growth in basement. Requires professional remediation.',
        amount: 12300,
        status: 'under_review',
        teamId: 'team3',
        submittedBy: 'user2',
        submittedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-18')),
        updatedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-19')),
        propertyType: 'Commercial',
        attachments: [
            'https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?w=800',
            'https://images.unsplash.com/photo-1628744876497-eb30460be9f6?w=800',
        ],
        metadata: {
            address: '789 Pine Rd, Springfield',
            incidentDate: '2024-01-05',
        }
    },
    {
        id: 'claim4',
        claimNumber: 'CLM-2024-004',
        title: 'Storm Damage - Roof Repair',
        description: 'Roof damage from recent storm. Multiple shingles missing, water intrusion.',
        amount: 19800,
        status: 'sent_to_insurance',
        teamId: 'team4',
        submittedBy: 'user2',
        submittedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-10')),
        updatedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-16')),
        propertyType: 'Residential',
        attachments: [
            'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800',
        ],
        metadata: {
            address: '321 Elm St, Springfield',
            incidentDate: '2024-01-07',
            approvedBy: 'user1',
            approvedAt: '2024-01-14',
            sentToInsurance: '2024-01-16',
        }
    },
    {
        id: 'claim5',
        claimNumber: 'CLM-2024-005',
        title: 'Water Damage - Bathroom',
        description: 'Bathroom flood from toilet overflow. Tile and drywall damage.',
        amount: 9800,
        status: 'rejected',
        teamId: 'team1',
        submittedBy: 'user4',
        submittedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-20')),
        updatedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-21')),
        propertyType: 'Residential',
        attachments: [],
        metadata: {
            address: '555 Maple Dr, Springfield',
            incidentDate: '2024-01-18',
            rejectedBy: 'user2',
            rejectedAt: '2024-01-21',
            rejectionReason: 'Insufficient documentation provided. Please resubmit with detailed photos and cost breakdown.',
        }
    },
    {
        id: 'claim6',
        claimNumber: 'CLM-2024-006',
        title: 'General Restoration - Office',
        description: 'Complete office restoration after water and smoke damage.',
        amount: 45000,
        status: 'pending_review',
        teamId: 'team5',
        submittedBy: 'user2',
        submittedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-22')),
        updatedAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-22')),
        propertyType: 'Commercial',
        attachments: [
            'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
            'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
        ],
        metadata: {
            address: '100 Business Blvd, Springfield',
            incidentDate: '2024-01-15',
        }
    },
];

const comments = [
    {
        id: 'comment1',
        claimId: 'claim1',
        userId: 'user2',
        text: 'Reviewed the photos. This looks like a significant claim. Scheduling site visit for tomorrow.',
        createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-16')),
    },
    {
        id: 'comment2',
        claimId: 'claim1',
        userId: 'user4',
        text: 'Site visit completed. Damage is more extensive than initially reported. Updating estimate.',
        createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-17')),
    },
    {
        id: 'comment3',
        claimId: 'claim2',
        userId: 'user1',
        text: 'Approved for immediate processing. High priority due to safety concerns.',
        createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-14')),
    },
];

async function seedData() {
    try {
        console.log('📝 Starting seed process...\n');

        // Map to store old user IDs to Firebase UIDs
        const userIdMap = {};

        // Create users in Auth and Firestore
        console.log('\n👥 Creating users...');
        for (const user of users) {
            try {
                // Create auth user with Admin SDK
                const userRecord = await auth.createUser({
                    email: user.email,
                    password: user.password,
                    displayName: user.name,
                });
                const firebaseUid = userRecord.uid;
                console.log(`  ✓ Created auth user: ${user.email}`);

                // Store mapping from old ID to Firebase UID
                userIdMap[user.id] = firebaseUid;

                // Create user document (without password)
                const { password, id, ...userData } = user;
                await db.collection('users').doc(firebaseUid).set({
                    ...userData,
                });
                console.log(`  ✓ Created user document: ${user.name}`);
            } catch (error) {
                if (error.code === 'auth/email-already-exists') {
                    console.log(`  ⚠ User already exists: ${user.email}`);
                } else {
                    console.error(`  ✗ Error creating user ${user.email}:`, error.message);
                }
            }
        }

        // Create organization
        console.log('\n🏢 Creating organization...');
        await db.collection('organizations').doc(organization.id).set(organization);
        console.log(`  ✓ Created: ${organization.name}`);

        // Create teams
        console.log('\n👥 Creating teams...');
        for (const team of teams) {
            await db.collection('teams').doc(team.id).set(team);
            console.log(`  ✓ Created: ${team.name}`);
        }

        // Create claims with mapped user IDs
        console.log('\n📋 Creating claims...');
        for (const claim of claims) {
            const claimData = {
                ...claim,
                submittedBy: userIdMap[claim.submittedBy] || claim.submittedBy,
            };
            // Also update metadata if it has user references
            if (claimData.metadata?.approvedBy) {
                claimData.metadata.approvedBy = userIdMap[claimData.metadata.approvedBy] || claimData.metadata.approvedBy;
            }
            if (claimData.metadata?.rejectedBy) {
                claimData.metadata.rejectedBy = userIdMap[claimData.metadata.rejectedBy] || claimData.metadata.rejectedBy;
            }

            await db.collection('claims').doc(claim.id).set(claimData);
            console.log(`  ✓ Created: ${claim.claimNumber} - ${claim.title}`);
        }

        // Create comments with mapped user IDs
        console.log('\n💬 Creating comments...');
        for (const comment of comments) {
            const commentData = {
                ...comment,
                userId: userIdMap[comment.userId] || comment.userId,
            };
            await db.collection('comments').doc(comment.id).set(commentData);
            console.log(`  ✓ Created comment on ${comment.claimId}`);
        }

        console.log('\n✅ Seed completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`  - ${users.length} users created`);
        console.log(`  - ${teams.length} teams created`);
        console.log(`  - ${claims.length} claims created`);
        console.log(`  - ${comments.length} comments created`);
        console.log('\n🔥 Firebase Emulator UI: http://localhost:4000');
        console.log('\n📝 User ID Mapping:');
        Object.entries(userIdMap).forEach(([oldId, newId]) => {
            console.log(`  ${oldId} -> ${newId} `);
        });

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Seed failed:', error);
        process.exit(1);
    }
}

// Run seed
seedData();
