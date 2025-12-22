const fs = require('fs');
const { execSync } = require('child_process');

// Find all relevant files in packages
const findFiles = () => {
    const result = execSync(`find packages -type f \\( -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.md" \\) -not -path "*/node_modules/*" -not -path "*/dist/*"`, { encoding: 'utf8' });
    return result.trim().split('\n').filter(f => f);
};

// Comprehensive replacement rules for ALL remaining Sui references
const replacements = [
    // Proto files - field names (snake_case)
    { from: /sui_balance/g, to: 'rtd_balance' },
    { from: /pending_total_sui_withdraw/g, to: 'pending_total_rtd_withdraw' },

    // Proto files - camelCase property names
    { from: /suiBalance/g, to: 'rtdBalance' },
    { from: /pendingTotalSuiWithdraw/g, to: 'pendingTotalRtdWithdraw' },

    // Proto files - SuiNS (name service)
    { from: /SuiNS/g, to: 'RtdNS' },

    // Proto files - StakedSui
    { from: /StakedSui/g, to: 'StakedRtd' },

    // Proto files - enum values
    { from: /SUI_MOVE_VERIFICATION_ERROR/g, to: 'RTD_MOVE_VERIFICATION_ERROR' },
    { from: /SUI_MOVE_VERIFICATION_TIMEDOUT/g, to: 'RTD_MOVE_VERIFICATION_TIMEDOUT' },

    // Proto files - system module reference
    { from: /sui_system::SystemState/g, to: 'rtd_system::SystemState' },

    // Proto files - SDK types reference
    { from: /sui_sdk_types/g, to: 'rtd_sdk_types' },

    // Kiosk test files
    { from: /getLatestSuiSystemState/g, to: 'getLatestRtdSystemState' },
    { from: /SUI_TOOLS_CONTAINER_ID/g, to: 'RTD_TOOLS_CONTAINER_ID' },
    { from: /suiToolsContainerId/g, to: 'rtdToolsContainerId' },
    { from: /sui_indexer_v2/g, to: 'rtd_indexer_v2' },

    // Dapp-kit - wallet standard types
    { from: /SuiSignMessageFeature/g, to: 'RtdSignMessageFeature' },

    // Dapp-kit - variable names
    { from: /suiFeatures/g, to: 'rtdFeatures' },
    { from: /suiClient/g, to: 'rtdClient' },
    { from: /suiWallets/g, to: 'rtdWallets' },
    { from: /suiContext/g, to: 'rtdContext' },

    // Dapp-kit - constants
    { from: /SUI_WALLET_NAME/g, to: 'RTD_WALLET_NAME' },
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
