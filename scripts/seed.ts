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
                createdBy: 'owner_user_001',
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp()
            });
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
