import { spawn } from 'child_process';

/**
 * Starts the Firebase emulators with the project context.
 */
const startEmulators = () => {
    const args = [
        'emulators:start',
        '--only', 'auth,firestore,storage',
        '--project', 'gamut-demo'
    ];

    console.log('🚀 Starting Firebase Emulators...');

    const child = spawn('firebase', args, {
        stdio: 'inherit',
        shell: true
    });

    child.on('exit', (code) => {
        process.exit(code || 0);
    });
};

startEmulators();
