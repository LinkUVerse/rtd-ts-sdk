const fs = require('fs');
const { execSync } = require('child_process');

// Find all TypeScript files in dapp-kit
const findFiles = () => {
    const result = execSync(`find packages/dapp-kit -type f \\( -name "*.ts" -o -name "*.tsx" \\) -not -path "*/node_modules/*" -not -path "*/dist/*"`, { encoding: 'utf8' });
    return result.trim().split('\n').filter(f => f);
};

// Comprehensive replacement rules for dapp-kit
const replacements = [
    // Types from wallet-standard
    { from: /SuiWalletFeatures/g, to: 'RtdWalletFeatures' },
    { from: /SuiFeatures/g, to: 'RtdFeatures' },
    { from: /SuiSignTransactionInput/g, to: 'RtdSignTransactionInput' },
    { from: /SuiSignTransactionOutput/g, to: 'RtdSignTransactionOutput' },
    { from: /SuiSignTransactionMethod/g, to: 'RtdSignTransactionMethod' },
    { from: /SuiSignTransactionBlockInput/g, to: 'RtdSignTransactionBlockInput' },
    { from: /SuiSignTransactionBlockOutput/g, to: 'RtdSignTransactionBlockOutput' },
    { from: /SuiSignTransactionBlockMethod/g, to: 'RtdSignTransactionBlockMethod' },
    { from: /SuiSignAndExecuteTransactionInput/g, to: 'RtdSignAndExecuteTransactionInput' },
    { from: /SuiSignAndExecuteTransactionOutput/g, to: 'RtdSignAndExecuteTransactionOutput' },
    { from: /SuiSignAndExecuteTransactionMethod/g, to: 'RtdSignAndExecuteTransactionMethod' },
    { from: /SuiSignAndExecuteTransactionBlockInput/g, to: 'RtdSignAndExecuteTransactionBlockInput' },
    { from: /SuiSignAndExecuteTransactionBlockOutput/g, to: 'RtdSignAndExecuteTransactionBlockOutput' },
    { from: /SuiSignAndExecuteTransactionBlockMethod/g, to: 'RtdSignAndExecuteTransactionBlockMethod' },
    { from: /SuiSignPersonalMessageInput/g, to: 'RtdSignPersonalMessageInput' },
    { from: /SuiSignPersonalMessageOutput/g, to: 'RtdSignPersonalMessageOutput' },
    { from: /SuiSignPersonalMessageMethod/g, to: 'RtdSignPersonalMessageMethod' },
    { from: /SuiReportTransactionEffectsInput/g, to: 'RtdReportTransactionEffectsInput' },
    { from: /SuiReportTransactionEffectsOutput/g, to: 'RtdReportTransactionEffectsOutput' },
    { from: /SuiReportTransactionEffectsMethod/g, to: 'RtdReportTransactionEffectsMethod' },
    { from: /SUI_CHAINS/g, to: 'RTD_CHAINS' },
    { from: /SUI_MAINNET_CHAIN/g, to: 'RTD_MAINNET_CHAIN' },
    { from: /SUI_TESTNET_CHAIN/g, to: 'RTD_TESTNET_CHAIN' },
    { from: /SUI_DEVNET_CHAIN/g, to: 'RTD_DEVNET_CHAIN' },
    { from: /SUI_LOCALNET_CHAIN/g, to: 'RTD_LOCALNET_CHAIN' },
    // Paginated method types
    { from: /SuiRpcPaginatedMethodName/g, to: 'RtdRpcPaginatedMethodName' },
    { from: /SuiRpcPaginatedMethods/g, to: 'RtdRpcPaginatedMethods' },
    // Variable names
    { from: /connectedSuiAccounts/g, to: 'connectedRtdAccounts' },
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
