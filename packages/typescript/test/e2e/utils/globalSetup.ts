// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { resolve } from 'path';
import { GenericContainer, getContainerRuntimeClient, Network, PullPolicy } from 'testcontainers';
import type { TestProject } from 'vitest/node';

import type { PrePublishedPackage } from './prePublish.js';
import { prePublishPackages } from './prePublish.js';

declare module 'vitest' {
	export interface ProvidedContext {
		localnetPort: number;
		graphqlPort: number;
		faucetPort: number;
		rtdToolsContainerId: string;
		prePublishedPackages: Record<string, PrePublishedPackage>;
	}
}

export default async function setup(project: TestProject) {
	const image = process.env.RTD_TOOLS_IMAGE;
	if (!image) {
		throw new Error('Set RTD_TOOLS_IMAGE to a built RTD tools image before E2E tests');
	}
	console.log('Starting test containers');
	const network = await new Network().start();

	const pg = await new GenericContainer('postgres')
		.withEnvironment({
			POSTGRES_USER: 'postgres',
			POSTGRES_PASSWORD: 'postgrespw',
			POSTGRES_DB: 'rtd_indexer_v2',
		})
		.withCommand(['-c', 'max_connections=500'])
		.withExposedPorts(5432)
		.withNetwork(network)
		.withPullPolicy(PullPolicy.alwaysPull())
		.start();

	const localnet = await new GenericContainer(image)
		// .withPullPolicy(PullPolicy.alwaysPull())
		.withCommand([
			'rtd',
			'start',
			'--with-faucet',
			'--force-regenesis',
			'--with-graphql',
			`--with-indexer=postgres://postgres:postgrespw@${pg.getIpAddress(network.getName())}:5432/rtd_indexer_v2`,
		])
		.withCopyDirectoriesToContainer([
			{ source: resolve(__dirname, '../data'), target: '/test-data' },
		])
		.withNetwork(network)
		.withExposedPorts(9000, 9123, 9124, 9125)
		.withLogConsumer((stream) => {
			stream.on('data', (data) => {
				console.log(data.toString());
			});
		})
		.start();

	const faucetPort = localnet.getMappedPort(9123);
	const localnetPort = localnet.getMappedPort(9000);
	const graphqlPort = localnet.getMappedPort(9125);
	const containerId = localnet.getId();

	// Set up the default rtd config so `rtd keytool` and `rtd move build` commands work.
	// The config file is checked in at data/localnet-client.yaml and copied into the container.
	const runtimeClient = await getContainerRuntimeClient();
	const container = runtimeClient.container.getById(containerId);
	await runtimeClient.container.exec(container, ['mkdir', '-p', '/root/.rtd/rtd_config']);
	await runtimeClient.container.exec(container, [
		'bash',
		'-c',
		"echo '[]' > /root/.rtd/rtd_config/rtd.keystore && cp /test-data/localnet-client.yaml /root/.rtd/rtd_config/client.yaml",
	]);

	project.provide('faucetPort', faucetPort);
	project.provide('localnetPort', localnetPort);
	project.provide('graphqlPort', graphqlPort);
	project.provide('rtdToolsContainerId', containerId);

	// Pre-publish shared packages
	const prePublished = await prePublishPackages({
		fullnodeUrl: `http://127.0.0.1:${localnetPort}`,
		faucetUrl: `http://127.0.0.1:${faucetPort}`,
		containerId,
	});
	project.provide('prePublishedPackages', prePublished);
}
