import { spawn } from 'child_process';

/**
 * Starts the Vite development server using the centralized config.
 */
const startDevServer = () => {
    const args = ['--config', 'config/vite.config.ts'];

    console.log('⚡ Starting development server...');

    const child = spawn('vite', args, {
        stdio: 'inherit',
        shell: true
    });

    child.on('exit', (code) => {
        process.exit(code || 0);
    });
};

startDevServer();
