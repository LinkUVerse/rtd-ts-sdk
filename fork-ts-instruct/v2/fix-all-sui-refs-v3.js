const fs = require('fs');
const { execSync } = require('child_process');

// Find all relevant files in packages
const findFiles = () => {
    const result = execSync(`find packages -type f \\( -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.md" \\) -not -path "*/node_modules/*" -not -path "*/dist/*"`, { encoding: 'utf8' });
    return result.trim().split('\n').filter(f => f);
};

// Final cleanup replacements for docs
const replacements = [
    // CHANGELOG references
    { from: /various Sui types/g, to: 'various Rtd types' },
    { from: /requesting sui from/g, to: 'requesting rtd from' },
    { from: /forums\.sui\.io/g, to: 'forums.rtd.life' },
    { from: /sui-api\.mdx/g, to: 'rtd-api.mdx' },
    { from: /root of `sui` repo/g, to: 'root of `rtd` repo' },
    { from: /sui-local-network/g, to: 'rtd-local-network' },

    // README references
    { from: /# Sui dApp Kit/g, to: '# Rtd dApp Kit' },
    { from: /The Sui dApp Kit/g, to: 'The Rtd dApp Kit' },
];

const files = findFiles();
let totalReplacements = 0;
let modifiedFiles = [];

for (const file of files) {
    try {
        let content = fs.readFileSync(file, 'utf8');
        let modified = false;
        let fileReplacements = 0;

        for (const { from, to } of replacements) {
            const matches = content.match(from);
            if (matches) {
                content = content.replace(from, to);
                modified = true;
                fileReplacements += matches.length;
            }
        }

        if (modified) {
            fs.writeFileSync(file, content);
            modifiedFiles.push({ file, count: fileReplacements });
            totalReplacements += fileReplacements;
        }
    } catch (err) {
        console.error('Error processing ' + file + ': ' + err.message);
    }
}

console.log('Modified files:');
for (const { file, count } of modifiedFiles) {
    console.log('  ' + file + ' (' + count + ' replacements)');
}
console.log('\nTotal replacements: ' + totalReplacements);
