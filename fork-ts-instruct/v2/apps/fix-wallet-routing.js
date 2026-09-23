#!/usr/bin/env node
/**
 * fix-wallet-routing.js - Fix wallet routing after DeepBook/Ledger removal
 * Copyright (c) LinkU Labs. All rights reserved.
 *
 * Usage: node fix-wallet-routing.js <wallet-dir>
 */

const fs = require('fs');
const path = require('path');

// Get wallet directory from command line argument
const walletDir =
	process.argv[2] ||
	'/Users/changzechuan/WenchuanProjects/SuiTestProjects/rtd-typescript/rtd-apps/wallet';

console.log('Fixing wallet routing...');
console.log(`Wallet directory: ${walletDir}`);

// ============================================
// Patterns to remove from routing files
// ============================================

const routingPatterns = [
	// Swap-related imports
	/import\s*\{\s*SwapPage\s*\}\s*from\s*['"][^'"]*swap[^'"]*['"];?\n?/g,
	/import\s*SwapPage\s*from\s*['"][^'"]*swap[^'"]*['"];?\n?/g,
	/import\s*\{\s*CoinsSelectionPage\s*\}\s*from\s*['"][^'"]*swap[^'"]*['"];?\n?/g,
	/import\s*CoinsSelectionPage\s*from\s*['"][^'"]*swap[^'"]*['"];?\n?/g,
	/import\s*\*\s*as\s*\w+\s*from\s*['"][^'"]*swap[^'"]*['"];?\n?/g,

	// Ledger-related imports
	/import\s*\{\s*ImportLedgerAccountsPage\s*\}\s*from\s*['"][^'"]*ImportLedgerAccountsPage[^'"]*['"];?\n?/g,
	/import\s*ImportLedgerAccountsPage\s*from\s*['"][^'"]*ImportLedgerAccountsPage[^'"]*['"];?\n?/g,
	/import\s*\{\s*useSuiLedgerClient\s*\}\s*from\s*['"][^'"]*SuiLedgerClientProvider[^'"]*['"];?\n?/g,
	/import\s*\{\s*useRtdLedgerClient\s*\}\s*from\s*['"][^'"]*RtdLedgerClientProvider[^'"]*['"];?\n?/g,
	/import\s*\{\s*SuiLedgerClientProvider\s*\}\s*from\s*['"][^'"]*['"];?\n?/g,
	/import\s*\{\s*RtdLedgerClientProvider\s*\}\s*from\s*['"][^'"]*['"];?\n?/g,
	/import\s*\{\s*LedgerSigner\s*\}\s*from\s*['"][^'"]*LedgerSigner[^'"]*['"];?\n?/g,
	/import\s*LedgerSigner\s*from\s*['"][^'"]*LedgerSigner[^'"]*['"];?\n?/g,
	/import\s*type\s*\{\s*[^}]*Ledger[^}]*\}\s*from\s*['"][^'"]*['"];?\n?/g,

	// DeepBook context imports
	/import\s*\{\s*DeepBookContextProvider\s*\}\s*from\s*['"][^'"]*deepBook[^'"]*['"];?\n?/g,
	/import\s*\{\s*useDeepBookContext\s*\}\s*from\s*['"][^'"]*deepBook[^'"]*['"];?\n?/g,
	/import\s*\{\s*DeepBookProvider\s*\}\s*from\s*['"][^'"]*['"];?\n?/g,

	// Swap routes
	/<Route\s+[^>]*path\s*=\s*["']swap\/?\*?["'][^>]*\/?>\s*\n?/g,
	/<Route\s+[^>]*path\s*=\s*["']swap\/coins-select["'][^>]*\/?>\s*\n?/g,
	/<Route\s+[^>]*path\s*=\s*["'][^"']*swap[^"']*["'][^>]*>[\s\S]*?<\/Route>\s*\n?/g,

	// Ledger routes
	/<Route\s+[^>]*path\s*=\s*["']import-ledger-accounts["'][^>]*\/?>\s*\n?/g,
	/<Route\s+[^>]*path\s*=\s*["'][^"']*ledger[^"']*["'][^>]*>[\s\S]*?<\/Route>\s*\n?/g,
	/<Route\s+[^>]*path\s*=\s*["']verify-ledger["'][^>]*\/?>\s*\n?/g,

	// Menu items related to swap/ledger
	/\{\s*\/\*\s*[Ss]wap\s*\*\/\s*\}[\s\S]*?(?=\{|\n\n)/g,
];

// ============================================
// Provider wrapper patterns
// ============================================

const providerPatterns = [
	// Remove SuiLedgerClientProvider wrapper but keep children
	{
		pattern: /<SuiLedgerClientProvider>([\s\S]*?)<\/SuiLedgerClientProvider>/g,
		replacement: '$1',
	},
	{
		pattern: /<RtdLedgerClientProvider>([\s\S]*?)<\/RtdLedgerClientProvider>/g,
		replacement: '$1',
	},
	// Remove DeepBookContextProvider wrapper but keep children
	{
		pattern: /<DeepBookContextProvider>([\s\S]*?)<\/DeepBookContextProvider>/g,
		replacement: '$1',
	},
	{
		pattern: /<DeepBookProvider>([\s\S]*?)<\/DeepBookProvider>/g,
		replacement: '$1',
	},
];

// ============================================
// Files to process
// ============================================

const routingFiles = [
	'src/ui/app/index.tsx',
	'src/ui/app/App.tsx',
	'src/ui/app/routes.tsx',
	'src/ui/app/Routes.tsx',
	'src/ui/app/pages/index.tsx',
	'src/ui/app/components/navigation/index.tsx',
	'src/ui/app/components/menu/content/index.tsx',
	'src/ui/app/redux/slices/index.ts',
];

// ============================================
// Process files
// ============================================

let filesProcessed = 0;
let filesModified = 0;

for (const relPath of routingFiles) {
	const fullPath = path.join(walletDir, relPath);

	if (!fs.existsSync(fullPath)) {
		console.log(`  [SKIP] ${relPath} (not found)`);
		continue;
	}

	filesProcessed++;
	let content = fs.readFileSync(fullPath, 'utf8');
	const originalContent = content;

	// Apply routing patterns
	for (const pattern of routingPatterns) {
		content = content.replace(pattern, '');
	}

	// Apply provider patterns (keep children)
	for (const { pattern, replacement } of providerPatterns) {
		content = content.replace(pattern, replacement);
	}

	// Clean up multiple empty lines
	content = content.replace(/\n{3,}/g, '\n\n');

	// Clean up trailing whitespace
	content = content.replace(/[ \t]+$/gm, '');

	if (content !== originalContent) {
		fs.writeFileSync(fullPath, content);
		console.log(`  [MODIFIED] ${relPath}`);
		filesModified++;
	} else {
		console.log(`  [OK] ${relPath}`);
	}
}

// ============================================
// Process additional files that might import removed modules
// ============================================

console.log('\nSearching for additional files with broken imports...');

function walkDir(dir, callback) {
	if (!fs.existsSync(dir)) return;

	const entries = fs.readdirSync(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);

		if (entry.isDirectory()) {
			if (!['node_modules', 'dist', '.git', '.turbo', 'coverage'].includes(entry.name)) {
				walkDir(fullPath, callback);
			}
		} else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
			callback(fullPath);
		}
	}
}

const brokenImportPatterns = [
	/from\s*['"][^'"]*\/deepBook[^'"]*['"]/,
	/from\s*['"][^'"]*\/deepbook[^'"]*['"]/,
	/from\s*['"][^'"]*\/swap[^'"]*['"]/,
	/from\s*['"][^'"]*\/ledger[^'"]*['"]/,
	/from\s*['"][^'"]*LedgerSigner[^'"]*['"]/,
	/from\s*['"][^'"]*LedgerAccount[^'"]*['"]/,
	/from\s*['"][^'"]*SuiLedgerClientProvider[^'"]*['"]/,
	/from\s*['"][^'"]*RtdLedgerClientProvider[^'"]*['"]/,
];

const additionalFiles = [];

walkDir(walletDir, (filePath) => {
	const content = fs.readFileSync(filePath, 'utf8');

	for (const pattern of brokenImportPatterns) {
		if (pattern.test(content)) {
			additionalFiles.push(filePath);
			break;
		}
	}
});

if (additionalFiles.length > 0) {
	console.log('\nFound files with potentially broken imports:');
	for (const file of additionalFiles) {
		const relPath = path.relative(walletDir, file);
		console.log(`  [WARNING] ${relPath}`);

		// Try to fix the file
		let content = fs.readFileSync(file, 'utf8');
		const originalContent = content;

		// Remove import lines for deleted modules
		const importRemovalPatterns = [
			/import\s+.*from\s*['"][^'"]*\/deepBook[^'"]*['"];?\n?/g,
			/import\s+.*from\s*['"][^'"]*\/deepbook[^'"]*['"];?\n?/g,
			/import\s+.*from\s*['"][^'"]*\/swap[^'"]*['"];?\n?/g,
			/import\s+.*from\s*['"][^'"]*\/ledger[^'"]*['"];?\n?/g,
			/import\s+.*from\s*['"][^'"]*LedgerSigner[^'"]*['"];?\n?/g,
			/import\s+.*from\s*['"][^'"]*LedgerAccount[^'"]*['"];?\n?/g,
			/import\s+.*from\s*['"][^'"]*SuiLedgerClientProvider[^'"]*['"];?\n?/g,
			/import\s+.*from\s*['"][^'"]*RtdLedgerClientProvider[^'"]*['"];?\n?/g,
		];

		for (const pattern of importRemovalPatterns) {
			content = content.replace(pattern, '');
		}

		if (content !== originalContent) {
			fs.writeFileSync(file, content);
			console.log(`    [FIXED] Removed broken imports`);
			filesModified++;
		}
	}
}

// ============================================
// Summary
// ============================================

console.log('\n--- Summary ---');
console.log(`Files processed: ${filesProcessed}`);
console.log(`Files modified: ${filesModified}`);
console.log(`Additional files found: ${additionalFiles.length}`);

if (filesModified > 0) {
	console.log('\nRouting cleanup completed successfully.');
} else {
	console.log('\nNo changes needed.');
}

process.exit(0);
