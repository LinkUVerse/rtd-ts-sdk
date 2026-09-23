const fs = require('fs');
const path = require('path');

const packages = [
	'packages/kiosk/package.json',
	'packages/wallet-standard/package.json',
	'packages/window-wallet-core/package.json',
	'packages/slush-wallet/package.json',
	'packages/dapp-kit/package.json',
];

const nameMap = {
	'@linku/rtd': 'rtd-typescript',
	'@linku/bcs': 'rtd-bcs',
	'@linku/utils': 'rtd-utils',
	'@linku/build-scripts': 'rtd-build-scripts',
	'@linku/kiosk': 'rtd-kiosk',
	'@linku/wallet-standard': 'rtd-wallet-standard',
	'@linku/window-wallet-core': 'rtd-window-wallet-core',
	'@linku/slush-wallet': 'rtd-slush-wallet',
	'@linku/dapp-kit': 'rtd-dapp-kit',
};

for (const pkgPath of packages) {
	const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

	// Fix dependencies
	const updateDeps = (deps) => {
		if (!deps) return deps;
		const newDeps = {};
		for (const [name, version] of Object.entries(deps)) {
			const newName = nameMap[name] || name;
			newDeps[newName] = version;
		}
		return newDeps;
	};

	pkg.dependencies = updateDeps(pkg.dependencies);
	pkg.devDependencies = updateDeps(pkg.devDependencies);
	pkg.peerDependencies = updateDeps(pkg.peerDependencies);

	fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, '\t') + '\n');
	console.log('Fixed: ' + pkgPath);
}
