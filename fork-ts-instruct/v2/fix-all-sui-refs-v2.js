const fs = require('fs');
const { execSync } = require('child_process');

// Find all relevant files in packages
const findFiles = () => {
    const result = execSync(`find packages -type f \\( -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.md" \\) -not -path "*/node_modules/*" -not -path "*/dist/*"`, { encoding: 'utf8' });
    return result.trim().split('\n').filter(f => f);
};

// Comprehensive replacement rules - more aggressive
const replacements = [
    // Chain identifiers (protocol) - MUST BE FIRST
    { from: /chain\.split\(':'\)\[0\] === 'sui'/g, to: "chain.split(':')[0] === 'rtd'" },
    { from: /'sui:mainnet'/g, to: "'rtd:mainnet'" },
    { from: /'sui:testnet'/g, to: "'rtd:testnet'" },
    { from: /'sui:devnet'/g, to: "'rtd:devnet'" },
    { from: /'sui:localnet'/g, to: "'rtd:localnet'" },
    { from: /'sui:test'/g, to: "'rtd:test'" },
    { from: /`sui:\${network}`/g, to: '`rtd:${network}`' },
    { from: /`sui:testnet`/g, to: '`rtd:testnet`' },

    // Storage key
    { from: /sui-dapp-kit:wallet-connection-info/g, to: 'rtd-dapp-kit:wallet-connection-info' },

    // CLI commands in arrays (as strings in test/setup files)
    { from: /'sui', 'client'/g, to: "'rtd', 'client'" },
    { from: /'sui', 'move'/g, to: "'rtd', 'move'" },
    { from: /\['sui', /g, to: "['rtd', " },

    // Move paths in comments
    { from: /0x2::sui::coin_registry/g, to: '0x2::rtd::coin_registry' },
    { from: /Coin<SUI>/g, to: 'Coin<RTD>' },

    // Comments text
    { from: /unique to Sui/g, to: 'unique to Rtd' },
    { from: /all Sui wallets/g, to: 'all Rtd wallets' },
    { from: /only Sui accounts/g, to: 'only Rtd accounts' },
    { from: /multi-chain wallets/g, to: 'multi-chain wallets' }, // Keep as is
    { from: /rewards SUI withdrawn/g, to: 'rewards RTD withdrawn' },
    { from: /the SUI in/g, to: 'the RTD in' },
    { from: /principal and rewards SUI/g, to: 'principal and rewards RTD' },
    { from: /Get Started with Sui/g, to: 'Get Started with Rtd' },
    { from: /supported by Sui/g, to: 'supported by Rtd' },
    { from: /name\.sui/g, to: 'name.rtd' },

    // sui.types reference in proto
    { from: /`sui\.types\./g, to: '`rtd.types.' },

    // Remaining generic replacements
    { from: /\bSui accounts\b/g, to: 'Rtd accounts' },
    { from: /\bSui wallets\b/g, to: 'Rtd wallets' },
    { from: /\bSUI tokens\b/g, to: 'RTD tokens' },
    { from: /\bSUI pool\b/g, to: 'RTD pool' },
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
