import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Force use of emulators - Must be set BEFORE initializeApp
const PROJECT_ID = 'gamut-demo';
process.env.GCLOUD_PROJECT = PROJECT_ID;
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8007';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9007';
process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9107';

console.log('🔧 Emulator Environment Configured:');
console.log(`- Project: ${PROJECT_ID}`);
console.log(`- Firestore: ${process.env.FIRESTORE_EMULATOR_HOST}`);
console.log(`- Auth: ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);

const app = initializeApp({ projectId: PROJECT_ID });
const db = getFirestore(app);
const auth = getAuth(app);

async function seed() {
    try {
        console.log('🌱 Starting GAMUT Comprehensive Seeding...');

        // IDs
        const orgId = 'org_demo_123';

        // Offices
        const officeMainId = 'office_main';
        const officeNorthId = 'office_north';

        // Main Branch Departments
        const deptMainMit = 'dept_main_mitigation';
        const deptMainRecon = 'dept_main_recon';

        // North Branch Departments
        const deptNorthMit = 'dept_north_mitigation';
        const deptNorthRecon = 'dept_north_recon';

        // 1. Organization
        console.log('📝 Creating Organization...');
        await db.collection('organizations').doc(orgId).set({
            id: orgId,
            name: 'Mainline Restoration Services',
            ownerId: 'owner_user_001',
            createdAt: FieldValue.serverTimestamp(),
            settings: { theme: 'dark' }
        });

        // 2. Offices
        console.log('🏢 Creating Offices...');
        const offices = [
            { id: officeMainId, orgId, name: 'Main Branch (HQ)', address: '100 Main St, Center City, NY', managerId: 'gm_main_001' },
            { id: officeNorthId, orgId, name: 'North Branch', address: '500 North Way, Upstate, NY', managerId: 'gm_north_001' }
        ];
        for (const o of offices) {
            await db.collection('offices').doc(o.id).set({ ...o, createdAt: FieldValue.serverTimestamp() });
        }

        // 3. Departments
        console.log('📂 Creating Departments...');
        const departments = [
            // Main Branch
            { id: deptMainMit, orgId, officeId: officeMainId, name: 'Mitigation (Main)' },
            { id: deptMainRecon, orgId, officeId: officeMainId, name: 'Reconstruction (Main)' },
            // North Branch
            { id: deptNorthMit, orgId, officeId: officeNorthId, name: 'Mitigation (North)' },
            { id: deptNorthRecon, orgId, officeId: officeNorthId, name: 'Reconstruction (North)' }
        ];
        for (const d of departments) {
            await db.collection('departments').doc(d.id).set({ ...d, managerId: 'owner_user_001', createdAt: FieldValue.serverTimestamp() });
        }

        // 4. Users
        console.log('👤 Creating Users (Auth & Profiles)...');
        const users = [
            // HQ / Global
            { uid: 'owner_user_001', email: 'owner@gamut.com', role: 'OWNER', name: 'Alice Owner', officeId: officeMainId },
            { uid: 'admin_user_001', email: 'admin@gamut.com', role: 'ORG_ADMIN', name: 'Bob Admin', officeId: officeMainId },

            // Main Branch (HQ)
            { uid: 'gm_main_001', email: 'gm_main@gamut.com', role: 'OFFICE_ADMIN', name: 'Charlie GM (Main)', officeId: officeMainId },

            { uid: 'mgr_main_mit_001', email: 'mgr_main_mit@gamut.com', role: 'DEPT_MANAGER', name: 'Dave Mgr (Main Mit)', officeId: officeMainId, departmentId: deptMainMit },
            { uid: 'mem_main_mit_001', email: 'mem_main_mit@gamut.com', role: 'MEMBER', name: 'Mike Tech (Main Mit)', officeId: officeMainId, departmentId: deptMainMit },

            { uid: 'mgr_main_rec_001', email: 'mgr_main_rec@gamut.com', role: 'DEPT_MANAGER', name: 'Eve Mgr (Main Rec)', officeId: officeMainId, departmentId: deptMainRecon },
            { uid: 'mem_main_rec_001', email: 'mem_main_rec@gamut.com', role: 'MEMBER', name: 'Frank Tech (Main Rec)', officeId: officeMainId, departmentId: deptMainRecon },

            // North Branch
            { uid: 'gm_north_001', email: 'gm_north@gamut.com', role: 'OFFICE_ADMIN', name: 'George GM (North)', officeId: officeNorthId },

            { uid: 'mgr_north_mit_001', email: 'mgr_north_mit@gamut.com', role: 'DEPT_MANAGER', name: 'Harry Mgr (North Mit)', officeId: officeNorthId, departmentId: deptNorthMit },
            { uid: 'mem_north_mit_001', email: 'mem_north_mit@gamut.com', role: 'MEMBER', name: 'Ivan Tech (North Mit)', officeId: officeNorthId, departmentId: deptNorthMit },

            { uid: 'mgr_north_rec_001', email: 'mgr_north_rec@gamut.com', role: 'DEPT_MANAGER', name: 'Jane Mgr (North Rec)', officeId: officeNorthId, departmentId: deptNorthRecon },
            { uid: 'mem_north_rec_001', email: 'mem_north_rec@gamut.com', role: 'MEMBER', name: 'Kelly Tech (North Rec)', officeId: officeNorthId, departmentId: deptNorthRecon },
        ];

        for (const u of users) {
            console.log(`   > Setting up ${u.email}...`);
            try {
                // Delete existing first to ensure clean state (optional but good for seed)
                try { await auth.deleteUser(u.uid); } catch { /* ignore */ }

                await auth.createUser({
                    uid: u.uid,
                    email: u.email,
                    password: 'password123',
                    displayName: u.name
                });
            } catch (e: unknown) {
                const error = e as { code: string; message: string };
                if (error.code === 'auth/uid-already-exists') {
                    // Update if exists
                    await auth.updateUser(u.uid, {
                        email: u.email,
                        displayName: u.name,
                        password: 'password123'
                    });
                } else if (error.code !== 'auth/email-already-exists') {
                    console.error(`     ❌ Auth Error for ${u.email}:`, error.message);
                }
            }

            await db.collection('users').doc(u.uid).set({
                uid: u.uid,
                email: u.email,
                displayName: u.name,
                role: u.role,
                orgId: orgId,
                officeId: u.officeId || null,
                departmentId: u.departmentId || null,
                onboardingCompleted: true,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp()
            });
        }

        // 5. Jobs
        console.log('💼 Creating Demo Jobs...');
        const jobs = [
            // Main Branch - Mitigation
            { id: 'job_main_mit_01', officeId: officeMainId, deptId: deptMainMit, cust: 'Main Mit Customer 1', status: 'MITIGATION', assignedTo: ['mem_main_mit_001'] },
            { id: 'job_main_mit_02', officeId: officeMainId, deptId: deptMainMit, cust: 'Main Mit Customer 2', status: 'FNOL', assignedTo: [] },

            // Main Branch - Recon
            { id: 'job_main_rec_01', officeId: officeMainId, deptId: deptMainRecon, cust: 'Main Rec Customer 1', status: 'RECONSTRUCTION', assignedTo: ['mem_main_rec_001'] },

            // North Branch - Mitigation
            { id: 'job_north_mit_01', officeId: officeNorthId, deptId: deptNorthMit, cust: 'North Mit Customer 1', status: 'MITIGATION', assignedTo: ['mem_north_mit_001'] },

            // North Branch - Recon (Unassigned)
            { id: 'job_north_rec_01', officeId: officeNorthId, deptId: deptNorthRecon, cust: 'North Rec Customer 1', status: 'RECONSTRUCTION', assignedTo: [] },

            // AI Demo Job
            {
                id: 'job_demo_ai_01',
                officeId: officeMainId,
                deptId: deptMainMit,
                cust: 'Sarah Connor (AI Demo)',
                status: 'MITIGATION',
                assignedTo: ['mem_main_mit_001'],
                claimData: {
                    preScan: {
                        measurements: [
                            { room: 'Living Room', area: '350 sqft', perimeter: '75 ft', height: '9 ft' },
                            { room: 'Kitchen', area: '200 sqft', perimeter: '50 ft', height: '9 ft' }
                        ],
                        images: [
                            { url: 'https://placehold.co/600x400/png?text=Living+Room+Damage', caption: 'Standing water in living room. Affected area includes hardwood flooring and baseboards.', timestamp: FieldValue.serverTimestamp() },
                            { url: 'https://placehold.co/600x400/png?text=Kitchen+Source', caption: 'Source: Dishwasher supply line failure.', timestamp: FieldValue.serverTimestamp() },
                            { url: 'https://placehold.co/600x400/png?text=Thermal+Image', caption: 'Thermal imaging showing moisture migration under cabinets.', timestamp: FieldValue.serverTimestamp() }
                        ],
                        notes: 'Initial scan indicates Class 2 water loss affecting approximately 40% of the ground floor. Source appears to be a burst pipe in the kitchen island.'
                    },
                    aiAnalysis: {
                        summary: 'High probability of Category 2 water loss. Immediate extraction and dehumidification recommended. Microbial growth potential is moderate if not treated within 24 hours.',
                        severityScore: 7,
                        recommendedActions: [
                            'Extract standing water',
                            'Remove baseboards in affected areas',
                            'Install 2 LGR Dehumidifiers',
                            'Apply antimicrobial agent'
                        ],
                        referencedStandards: [
                            { code: 'IICRC S500', description: 'Standard and Reference Guide for Professional Water Damage Restoration' },
                            { code: 'ANSI/IICRC S520', description: 'Standard for Professional Mold Remediation' }
                        ]
                    },
                    lineItems: [
                        { id: 'li_001', category: 'Mitigation', description: 'Water Extraction (Clean/Grey)', quantity: 550, unit: 'SF', unitPrice: 0.85, total: 467.50 },
                        { id: 'li_002', category: 'Mitigation', description: 'Tear out wet non-salvageable drywall', quantity: 120, unit: 'SF', unitPrice: 1.50, total: 180.00 },
                        { id: 'li_003', category: 'Equipment', description: 'LGR Dehumidifier (Large)', quantity: 3, unit: 'DA', unitPrice: 110.00, total: 330.00 },
                        { id: 'li_004', category: 'Equipment', description: 'Air Mover (Axial)', quantity: 8, unit: 'DA', unitPrice: 35.00, total: 280.00 }
                    ]
                }
            },
        ];

        for (const j of jobs) {
            await db.collection('jobs').doc(j.id).set({
                id: j.id,
                orgId,
                officeId: j.officeId,
                departmentId: j.deptId,
                status: j.status,
                customer: { name: j.cust, phone: '555-0000', email: 'cust@example.com' },
                property: { address: '123 Fake St', city: 'City', state: 'ST', zip: '12345' },
                insurance: { carrier: 'State Farm', claimNumber: `CLM-${j.id}` },
                assignedUserIds: j.assignedTo,
                financials: {
                    revenue: Math.floor(Math.random() * 45000) + 5000, // Random $5k - $50k
                    paid: 0,
                    balance: 0
                },
                // @ts-ignore
                claimData: j.claimData || null,
                createdBy: 'owner_user_001',
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp()
            });
        }

        // 6. Tasks
        console.log('✅ Creating Tasks...');
        const tasks = [
            { id: 'task_001', userId: 'owner_user_001', title: 'Review Q3 Financials', completed: false, dueDate: FieldValue.serverTimestamp() },
            { id: 'task_002', userId: 'owner_user_001', title: 'Approve New Hires', completed: true, dueDate: FieldValue.serverTimestamp() },
            { id: 'task_003', userId: 'gm_main_001', title: 'Weekly Staff Meeting', completed: false, dueDate: FieldValue.serverTimestamp() },
            { id: 'task_004', userId: 'gm_main_001', title: 'Client Follow-up: Smith Job', completed: false, dueDate: FieldValue.serverTimestamp() },
        ];
        for (const t of tasks) {
            await db.collection('tasks').doc(t.id).set({
                ...t,
                createdAt: FieldValue.serverTimestamp()
            });
        }

        // 7. Activity Logs
        console.log('📜 Creating Activity Logs...');
        const activities = [
            { id: 'act_001', orgId, userId: 'owner_user_001', userName: 'Alice Owner', action: 'Created new job: Main Mit Customer 1', type: 'JOB', timestamp: FieldValue.serverTimestamp() },
            { id: 'act_002', orgId, userId: 'mem_main_mit_001', userName: 'Mike Tech', action: 'Updated status to Mitigation', type: 'STATUS', timestamp: FieldValue.serverTimestamp() },
            { id: 'act_003', orgId, userId: 'gm_main_001', userName: 'Charlie GM', action: 'Added note to job CLM-job_main_mit_02', type: 'NOTE', timestamp: FieldValue.serverTimestamp() },
            { id: 'act_004', orgId, userId: 'system', userName: 'System', action: 'Weekly report generated', type: 'SYSTEM', timestamp: FieldValue.serverTimestamp() },
        ];
        for (const a of activities) {
            await db.collection('activity_logs').doc(a.id).set(a);
        }

        console.log('\n✅ Seeding complete!');
        console.log('You can now log in using the demo buttons on the login page.');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Fatal Seeding Error:', error);
        process.exit(1);
    }
}

seed();
