import { spawn } from 'child_process';

/**
 * Runs ESLint using the centralized configuration.
 */
const runLint = () => {
    const args = [
        '--config', 'config/eslint.config.js',
        '.'
    ];

    console.log('🔍 Running linter...');

    const child = spawn('eslint', args, {
        stdio: 'inherit',
        shell: true
    });

    child.on('exit', (code) => {
        if (code === 0) {
            console.log('✅ Lint check passed!');
        } else {
            console.error('❌ Lint check failed.');
        }
        process.exit(code || 0);
    });
};

runLint();
