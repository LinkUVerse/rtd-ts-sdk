const fs = require('fs');
const { execSync } = require('child_process');

// Find all relevant files in packages
const findFiles = () => {
	const result = execSync(
		`find packages -type f \\( -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.md" \\) -not -path "*/node_modules/*" -not -path "*/dist/*"`,
		{ encoding: 'utf8' },
	);
	return result
		.trim()
		.split('\n')
		.filter((f) => f);
};

// Comprehensive replacement rules
const replacements = [
	// Text content
	{ from: /\bSui blockchain\b/g, to: 'Rtd blockchain' },
	{ from: /\bSui network\b/g, to: 'Rtd network' },
	{ from: /\bSui ecosystem\b/g, to: 'Rtd ecosystem' },
	{ from: /\bSui TypeScript SDK\b/g, to: 'Rtd TypeScript SDK' },
	{ from: /\bSui TS SDK\b/g, to: 'Rtd TS SDK' },
	{ from: /\bSui JSON RPC\b/g, to: 'Rtd JSON RPC' },
	{ from: /\bSui RPC\b/g, to: 'Rtd RPC' },
	{ from: /\bSui Move\b/g, to: 'Rtd Move' },
	{ from: /\bSui wallet\b/gi, to: 'Rtd wallet' },
	{ from: /\bSui wallets\b/gi, to: 'Rtd wallets' },
	{ from: /\bSui coins\b/gi, to: 'Rtd coins' },
	{ from: /\bSui coin\b/gi, to: 'Rtd coin' },
	{ from: /\bSui address\b/gi, to: 'Rtd address' },
	{ from: /\bSui Address\b/g, to: 'Rtd Address' },
	{ from: /\bSUI tokens\b/g, to: 'RTD tokens' },
	{ from: /\bSUI coin\b/g, to: 'RTD coin' },
	{ from: /\bstaked sui\b/gi, to: 'staked rtd' },
	{ from: /\bTrade and earn on Sui\b/g, to: 'Trade and earn on Rtd' },
	{ from: /\bConnecting to Sui Network\b/g, to: 'Connecting to Rtd Network' },
	{ from: /\bTransfer Sui\b/g, to: 'Transfer Rtd' },
	{ from: /\brequest sui\b/gi, to: 'request rtd' },
	{ from: /\brequest Sui\b/g, to: 'request Rtd' },
	{ from: /\bSui's SystemState\b/g, to: "Rtd's SystemState" },
	{ from: /\bdefaults to 0x2::sui::SUI\b/g, to: 'defaults to 0x2::rtd::RTD' },
	{ from: /\bCoin<SUI>\b/g, to: 'Coin<RTD>' },
	{ from: /\bSui ObjectId\b/g, to: 'Rtd ObjectId' },
	{ from: /\bBalance of SUI\b/g, to: 'Balance of RTD' },
	{ from: /\bamount of SUI\b/g, to: 'amount of RTD' },
	{ from: /\bnumber of SUI\b/g, to: 'number of RTD' },
	{ from: /\bSUI set aside\b/g, to: 'RTD set aside' },
	{ from: /\bsui address of\b/gi, to: 'rtd address of' },
	{ from: /\bthe Sui\b/g, to: 'the Rtd' },
	{ from: /\bon Sui\b/g, to: 'on Rtd' },
	{ from: /\bfor Sui\b/g, to: 'for Rtd' },
	{ from: /\bin Sui\b/g, to: 'in Rtd' },

	// Comments about deprecated features
	{ from: /sui:signTransaction/g, to: 'rtd:signTransaction' },
	{ from: /sui:signAndExecuteTransaction/g, to: 'rtd:signAndExecuteTransaction' },
	{ from: /sui:signPersonalMessage/g, to: 'rtd:signPersonalMessage' },
	{ from: /sui:signMessage/g, to: 'rtd:signMessage' },
	{ from: /sui:getSupportedIntents/g, to: 'rtd:getSupportedIntents' },
	{ from: /sui:signTransactionBlock/g, to: 'rtd:signTransactionBlock' },

	// Chain names in comments
	{ from: /Sui Devnet/g, to: 'Rtd Devnet' },
	{ from: /Sui Testnet/g, to: 'Rtd Testnet' },
	{ from: /Sui Localnet/g, to: 'Rtd Localnet' },
	{ from: /Sui Mainnet/g, to: 'Rtd Mainnet' },
	{ from: /valid Sui chain/g, to: 'valid Rtd chain' },

	// URLs (be careful with these)
	{ from: /fullnode\.devnet\.sui\.io/g, to: 'fullnode.devnet.rtd.life' },
	{ from: /fullnode\.testnet\.sui\.io/g, to: 'fullnode.testnet.rtd.life' },
	{ from: /fullnode\.mainnet\.sui\.io/g, to: 'fullnode.mainnet.rtd.life' },
	{ from: /faucet\.devnet\.sui\.io/g, to: 'faucet.devnet.rtd.life' },
	{ from: /faucet\.testnet\.sui\.io/g, to: 'faucet.testnet.rtd.life' },
	{ from: /faucet\.sui\.io/g, to: 'faucet.rtd.life' },
	{ from: /docs\.sui\.io/g, to: 'docs.rtd.life' },

	// JSON schema
	{ from: /list of SUI coins/g, to: 'list of RTD coins' },

	// Tools/commands
	{ from: /execSuiTools/g, to: 'execRtdTools' },
	{ from: /SuiTools/g, to: 'RtdTools' },
	{ from: /sui-tools/g, to: 'rtd-tools' },
	{ from: /sui client/g, to: 'rtd client' },
	{ from: /sui move/g, to: 'rtd move' },
	{ from: /sui version/g, to: 'rtd version' },

	// Docker images
	{ from: /mysten\/sui-tools/g, to: 'linku/rtd-tools' },

	// SDK references
	{ from: /sui-rust-sdk/g, to: 'rtd-rust-sdk' },
	{ from: /sui-json-rpc/g, to: 'rtd-json-rpc' },
	{ from: /sui-types/g, to: 'rtd-types' },

	// Variable/type names that might have been missed
	{ from: /SUI_TOOLS_TAG/g, to: 'RTD_TOOLS_TAG' },
	{ from: /toSuiPublicKey/g, to: 'toRtdPublicKey' },
	{ from: /SuiEpochId/g, to: 'RtdEpochId' },

	// Migration guide URLs
	{ from: /migrations\/sui-1\.0/g, to: 'migrations/rtd-1.0' },

	// GitHub references
	{ from: /LinkUVerse\/sui/g, to: 'LinkUVerse/rtd' },
	{ from: /linkulabs\.github\.io\/sui/g, to: 'linkulabs.github.io/rtd' },
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
