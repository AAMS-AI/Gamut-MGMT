import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Force use of emulators - Must be set BEFORE initializeApp
const PROJECT_ID = 'gamut-demo';
process.env.GCLOUD_PROJECT = PROJECT_ID;
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8007';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9007';
process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9107';

console.log('🔧 Emulator Environment Configured (Single Office):');
console.log(`- Project: ${PROJECT_ID}`);

const app = initializeApp({ projectId: PROJECT_ID });
const db = getFirestore(app);
const auth = getAuth(app);

async function seed() {
    try {
        console.log('🌱 Starting GAMUT Single-Office Seeding...');

        const orgId = 'org_demo_single';
        const officeMainId = 'office_main_single';
        const deptMainMit = 'dept_main_mit_s';
        const deptMainRecon = 'dept_main_rec_s';

        // 1. Organization
        console.log('📝 Creating Organization...');
        await db.collection('organizations').doc(orgId).set({
            id: orgId,
            name: 'Single Branch Restorations',
            ownerId: 'owner_single',
            createdAt: FieldValue.serverTimestamp(),
            settings: { theme: 'dark' }
        });

        // 2. Office
        console.log('🏢 Creating 1 Office...');
        await db.collection('offices').doc(officeMainId).set({
            id: officeMainId,
            orgId,
            name: 'Headquarters',
            address: '1 HQ Blvd, Metro City',
            managerId: 'gm_single',
            createdAt: FieldValue.serverTimestamp()
        });

        // 3. Departments
        console.log('📂 Creating Departments...');
        const departments = [
            { id: deptMainMit, orgId, officeId: officeMainId, name: 'Mitigation' },
            { id: deptMainRecon, orgId, officeId: officeMainId, name: 'Reconstruction' }
        ];
        for (const d of departments) {
            await db.collection('departments').doc(d.id).set({ ...d, managerId: 'owner_single', createdAt: FieldValue.serverTimestamp() });
        }

        // 4. Users
        console.log('👤 Creating Users...');
        const users = [
            { uid: 'owner_single', email: 'owner@single.com', role: 'OWNER', name: 'Oscar Owner', officeId: officeMainId },
            { uid: 'gm_single', email: 'gm@single.com', role: 'OFFICE_ADMIN', name: 'Gary GM', officeId: officeMainId },
            { uid: 'mgr_mit_s', email: 'mgr.mit@single.com', role: 'DEPT_MANAGER', name: 'Mary Mitigation', officeId: officeMainId, departmentId: deptMainMit },
            { uid: 'mem_mit_s', email: 'tech.mit@single.com', role: 'MEMBER', name: 'Mike Member', officeId: officeMainId, departmentId: deptMainMit },
        ];

        for (const u of users) {
            try {
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
                    await auth.updateUser(u.uid, { email: u.email, displayName: u.name, password: 'password123' });
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

        console.log('\n✅ Single-Office Seeding Complete!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Fatal Seeding Error:', error);
        process.exit(1);
    }
}

seed();
