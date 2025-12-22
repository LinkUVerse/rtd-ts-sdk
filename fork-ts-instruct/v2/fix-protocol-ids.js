const fs = require('fs');
const { execSync } = require('child_process');

// Find all TypeScript files in dapp-kit
const findFiles = () => {
    const result = execSync(`find packages/dapp-kit -type f \\( -name "*.ts" -o -name "*.tsx" \\) -not -path "*/node_modules/*" -not -path "*/dist/*"`, { encoding: 'utf8' });
    return result.trim().split('\n').filter(f => f);
};

// Protocol identifier replacements
const replacements = [
    { from: /'sui:signTransaction'/g, to: "'rtd:signTransaction'" },
    { from: /'sui:signTransactionBlock'/g, to: "'rtd:signTransactionBlock'" },
    { from: /'sui:signAndExecuteTransaction'/g, to: "'rtd:signAndExecuteTransaction'" },
    { from: /'sui:signAndExecuteTransactionBlock'/g, to: "'rtd:signAndExecuteTransactionBlock'" },
    { from: /'sui:signPersonalMessage'/g, to: "'rtd:signPersonalMessage'" },
    { from: /'sui:signMessage'/g, to: "'rtd:signMessage'" },
    { from: /'sui:reportTransactionEffects'/g, to: "'rtd:reportTransactionEffects'" },
    { from: /'sui:getCapabilities'/g, to: "'rtd:getCapabilities'" },
    { from: /'sui:unknown'/g, to: "'rtd:unknown'" },
    // Also handle double quotes
    { from: /"sui:signTransaction"/g, to: '"rtd:signTransaction"' },
    { from: /"sui:signTransactionBlock"/g, to: '"rtd:signTransactionBlock"' },
    { from: /"sui:signAndExecuteTransaction"/g, to: '"rtd:signAndExecuteTransaction"' },
    { from: /"sui:signAndExecuteTransactionBlock"/g, to: '"rtd:signAndExecuteTransactionBlock"' },
    { from: /"sui:signPersonalMessage"/g, to: '"rtd:signPersonalMessage"' },
    { from: /"sui:signMessage"/g, to: '"rtd:signMessage"' },
    { from: /"sui:reportTransactionEffects"/g, to: '"rtd:reportTransactionEffects"' },
    { from: /"sui:getCapabilities"/g, to: '"rtd:getCapabilities"' },
];

const files = findFiles();
let totalReplacements = 0;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    for (const { from, to } of replacements) {
        const matches = content.match(from);
        if (matches) {
            content = content.replace(from, to);
            modified = true;
            totalReplacements += matches.length;
        }
    }

    if (modified) {
        fs.writeFileSync(file, content);
        console.log('Fixed: ' + file);
    }
}

console.log('\nTotal replacements: ' + totalReplacements);
