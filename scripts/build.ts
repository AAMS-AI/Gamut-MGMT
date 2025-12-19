import { spawnSync } from 'child_process';

/**
 * Orchestrates the production build process.
 */
const runBuild = () => {
    console.log('📦 Starting production build...');

    console.log('\n--- 1. Running type check (tsc) ---');
    const tsc = spawnSync('tsc', ['-b'], { stdio: 'inherit', shell: true });

    if (tsc.status !== 0) {
        console.error('❌ Type check failed.');
        process.exit(tsc.status || 1);
    }

    console.log('\n--- 2. Building client bundle (vite) ---');
    const vite = spawnSync('vite', ['build', '--config', 'config/vite.config.ts'], {
        stdio: 'inherit',
        shell: true
    });

    if (vite.status !== 0) {
        console.error('❌ Build failed.');
        process.exit(vite.status || 1);
    }

    console.log('\n✅ Build completed successfully!');
};

runBuild();
