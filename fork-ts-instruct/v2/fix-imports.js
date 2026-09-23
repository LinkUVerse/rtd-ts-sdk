const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all TypeScript files in new packages
const findFiles = () => {
	const dirs = [
		'packages/kiosk',
		'packages/wallet-standard',
		'packages/window-wallet-core',
		'packages/slush-wallet',
		'packages/dapp-kit',
	];

	let files = [];
	for (const dir of dirs) {
		if (fs.existsSync(dir)) {
			const result = execSync(
				`find ${dir} -type f \\( -name "*.ts" -o -name "*.tsx" \\) -not -path "*/node_modules/*" -not -path "*/dist/*"`,
				{ encoding: 'utf8' },
			);
			files = files.concat(
				result
					.trim()
					.split('\n')
					.filter((f) => f),
			);
		}
	}
	return files;
};

// Replacement rules
const replacements = [
	// Package import replacements (with subpaths)
	{ from: /@linku\/rtd\//g, to: 'rtd-typescript/' },
	{ from: /'@linku\/rtd'/g, to: "'rtd-typescript'" },
	{ from: /"@linku\/rtd"/g, to: '"rtd-typescript"' },
	{ from: /@linku\/utils/g, to: 'rtd-utils' },
	{ from: /@linku\/bcs/g, to: 'rtd-bcs' },
	{ from: /@linku\/build-scripts/g, to: 'rtd-build-scripts' },
	{ from: /@linku\/kiosk/g, to: 'rtd-kiosk' },
	{ from: /@linku\/wallet-standard/g, to: 'rtd-wallet-standard' },
	{ from: /@linku\/window-wallet-core/g, to: 'rtd-window-wallet-core' },
	{ from: /@linku\/slush-wallet/g, to: 'rtd-slush-wallet' },
	{ from: /@linku\/dapp-kit/g, to: 'rtd-dapp-kit' },
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
