#!/usr/bin/env python3
"""Migrate upstream fixtures whose signed bytes or live services cannot be renamed."""

from __future__ import annotations

from functools import reduce
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[2]


def edit(relative: str, transform) -> None:
    path = ROOT / relative
    old = path.read_text()
    new = transform(old)
    if new == old:
        return
    path.write_text(new)
    print(f"Repaired {relative}")


def replace_once(source: str, old: str, new: str) -> str:
    if new in source:
        return source
    if source.count(old) != 1:
        raise ValueError(f"Expected one occurrence of {old[:70]!r}, got {source.count(old)}")
    return source.replace(old, new, 1)


def seal_encrypt(source: str) -> str:
    source = replace_once(
        source,
        "a2f2624fda29c88ccacd286b560572d8c1261a5687e0c0cdbdcbef93bf0ec5c373563fac64a2cb5bb326cc6181ee65d7",
        "ae024fcb1b39e7c8a2dba3e0c88e85ec36def038b4a17faf5290418aa40f3456c58dfc40a395a3c73d51188e2060e0e6",
    )
    source = replace_once(
        source,
        "89befdfd6aecdce1305ddbca891d1c29f0507cfd5225cd6b11e52e60f088ea87",
        "8765ff58a839e79eea03f7fbabbbcf2dfba3e4467f28c3b10a6a31b5b221d929",
    )
    if "\tit('Rust test vector decryption'" in source:
        start = source.index("\tit('Rust test vector decryption'")
        end = source.index("\n\tit('test single key server'", start)
        section = source[start:end]
        section = replace_once(section, "Rust test vector decryption", "rejects historical upstream Seal ciphertext")
        section = replace_once(
            section,
            "\t\t).resolves.toEqual(msg);",
            "\t\t).rejects.toThrow('Invalid nonce');",
        )
        section = section.replace("\t\tconst msg = new TextEncoder().encode('Hello, world!');\n", "")
        source = source[:start] + section + source[end:]
    elif "\tit('rejects historical upstream Seal ciphertext'" not in source:
        raise ValueError("Could not locate the historical ciphertext fixture")

    if "\tit('check share consistency'" in source:
        start = source.index("\tit('check share consistency'")
        end = source.rfind("\n});")
        if start >= end:
            raise ValueError("Could not locate the historical share fixture")
        source = source[:start] + '''\tit('rejects an inconsistent key while accepting valid threshold shares', async () => {
\t\tconst [sk1, pk1] = generateKeyPair();
\t\tconst [sk2, pk2] = generateKeyPair();
\t\tconst [sk3, pk3] = generateKeyPair();
\t\tconst objectIds = [1, 2, 3].map((n) => `0x${n.toString(16).padStart(64, '0')}`);
\t\tconst message = new TextEncoder().encode('RTD Seal threshold shares');
\t\tconst { encryptedObject } = await encrypt({
\t\t\tkeyServers: [pk1, pk2, pk3].map((pk, i) => ({
\t\t\t\tobjectId: objectIds[i],
\t\t\t\tpk: pk.toBytes(),
\t\t\t\tname: `server-${i}`,
\t\t\t\turl: `https://example.com/${i}`,
\t\t\t\tkeyType: 0,
\t\t\t\tserverType: 'Independent' as const,
\t\t\t})),
\t\t\tkemType: KemType.BonehFranklinBLS12381DemCCA,
\t\t\tthreshold: 2,
\t\t\tpackageId: `0x${'0'.repeat(64)}`,
\t\t\tid: '01020304',
\t\t\tencryptionInput: new AesGcm256(message, new Uint8Array()),
\t\t});
\t\tconst parsed = EncryptedObject.parse(encryptedObject);
\t\tconst id = createFullId(parsed.packageId, parsed.id);
\t\tconst idBytes = fromHex(id);
\t\tconst keys = [sk1, sk2, sk3].map((sk) => extractUserSecretKey(sk, idBytes));
\t\tconst goodKeys = new Map<KeyCacheKey, G1Element>([
\t\t\t[`${id}:${objectIds[1]}`, keys[1]],
\t\t\t[`${id}:${objectIds[2]}`, keys[2]],
\t\t]);
\t\tconst badKeys = new Map(goodKeys);
\t\tbadKeys.set(`${id}:${objectIds[0]}`, G1Element.generator());
\t\tawait expect(decrypt({ encryptedObject: parsed, keys: badKeys })).rejects.toThrow();
\t\tawait expect(decrypt({ encryptedObject: parsed, keys: goodKeys })).resolves.toEqual(message);
\t\tawait expect(
\t\t\tdecrypt({ encryptedObject: parsed, keys: goodKeys, publicKeys: [pk1, pk2, pk3] }),
\t\t).resolves.toEqual(message);
\t\tawait expect(
\t\t\tdecrypt({
\t\t\t\tencryptedObject: parsed,
\t\t\t\tkeys: goodKeys,
\t\t\t\tpublicKeys: [G2Element.generator(), pk2, pk3],
\t\t\t}),
\t\t).rejects.toThrow('Invalid shares');
\t});
''' + source[end:]
    elif "\tit('rejects an inconsistent key while accepting valid threshold shares'" not in source:
        raise ValueError("Could not locate the historical share fixture")
    return source


def seal_key_server(source: str) -> str:
    source = replace_once(source, "import { fromBase64 } from 'rtd-bcs';", "import { fromBase64, fromHex, toBase64 } from 'rtd-bcs';\nimport { bls12_381 } from '@noble/curves/bls12-381.js';")
    source = source.replace("import { getJsonRpcFullnodeUrl } from 'rtd-typescript/jsonRpc';\n", "")
    source = replace_once(source, "import { SealClient } from '../../src/client.js';", "import { SealClient } from '../../src/client.js';\nimport { DST_POP } from '../../src/ibe.js';")
    source = replace_once(source, "import { Version } from '../../src/utils.js';", "import { flatten, Version } from '../../src/utils.js';")
    if "\tit(\n\t\t'test verifyKeyServerInfo (mocked)'" in source:
        start = source.index("\tit(\n\t\t'test verifyKeyServerInfo (mocked)'")
        end = source.index("\n\tit('test verifyKeyServer throws SealAPIError", start)
        source = source[:start] + '''\tit('verifies an RTD key server proof of possession (mocked)', async () => {
\t\tconst secretKey = bls12_381.utils.randomSecretKey();
\t\tconst publicKey = bls12_381.shortSignatures.getPublicKey(secretKey).toBytes();
\t\tconst message = flatten([DST_POP, publicKey, fromHex(id)]);
\t\tconst proof = bls12_381.shortSignatures.sign(
\t\t\tbls12_381.shortSignatures.hash(message),
\t\t\tsecretKey,
\t\t);
\t\tconst headers = new Headers({ 'x-keyserver-version': '0.4.1' });
\t\tconst mockFetch = vi.fn().mockResolvedValue({
\t\t\tok: true,
\t\t\tstatus: 200,
\t\t\theaders,
\t\t\tjson: async () => ({ service_id: id, pop: toBase64(proof.toBytes()) }),
\t\t});
\t\tawait expect(
\t\t\tverifyKeyServer(
\t\t\t\t{ objectId: id, pk: publicKey, name, url, keyType, serverType: 'Independent' },
\t\t\t\t10_000,
\t\t\t\tundefined,
\t\t\t\tundefined,
\t\t\t\tmockFetch,
\t\t\t),
\t\t).resolves.toBe(true);
\t});
''' + source[end:]
    elif "\tit('verifies an RTD key server proof of possession (mocked)'" not in source:
        raise ValueError("Could not locate the key-server PoP fixture")
    return source


def seal_session(source: str) -> str:
    source = replace_once(source, "import { RtdGrpcClient } from 'rtd-typescript/grpc';", "import type { SealCompatibleClient } from '../../src/types.js';")
    source = source.replace("import { getJsonRpcFullnodeUrl } from 'rtd-typescript/jsonRpc';\n", "")
    source = replace_once(
        source,
        "\t\tconst rtdClient = new RtdGrpcClient({\n\t\t\tnetwork: 'testnet',\n\t\t\tbaseUrl: getJsonRpcFullnodeUrl('testnet'),\n\t\t});",
        "\t\tconst rtdClient = {\n\t\t\tcore: { getObject: async () => ({ object: { version: '1' } }) },\n\t\t} as unknown as SealCompatibleClient;",
    )
    return source


def seal_integration(source: str) -> str:
    marker = "describe('Integration test', () => {"
    if "const liveTest = it.runIf(" not in source:
        source = replace_once(source, marker, "const liveTest = it.runIf(process.env.RTD_SEAL_LIVE === '1');\n\n" + marker)
    for name in (
        "[testnet servers] whitelist example encrypt and decrypt scenarios",
        "[ci servers] whitelist example encrypt and decrypt scenarios",
        "test getDerivedKeys",
        "test decryption with LE nonce",
        "test getDerivedKeys with MVR name",
        "client extension",
        "test different validateEncryptionServices errors",
        "test fetchKeys throws SealAPIError",
        "test session key verify personal message signature",
    ):
        old = f"it('{name}'"
        new = f"liveTest('{name}'"
        if name.startswith('['):
            old, new = f"it(\n\t\t'{name}'", f"liveTest(\n\t\t'{name}'"
        source = replace_once(source, old, new)
    return source


def docker_e2e(source: str) -> str:
    # The pinned tags came from upstream Sui containers. They cannot identify
    # an RTD localnet image, and blindly renaming the repository gives a 404.
    source = re.sub(
        r"const RTD_TOOLS_TAG =\n\tprocess\.env\.RTD_TOOLS_TAG \|\|\n\t\(process\.arch === 'arm64'\n\t\t\? '[0-9a-f]+-arm64'\n\t\t: '[0-9a-f]+'\);\n\n",
        "",
        source,
    )
    source = replace_once(
        source,
        "\tconsole.log('Starting test containers');",
        "\tconst image = process.env.RTD_TOOLS_IMAGE;\n"
        "\tif (!image) {\n"
        "\t\tthrow new Error('Set RTD_TOOLS_IMAGE to a built RTD tools image before E2E tests');\n"
        "\t}\n"
        "\tconsole.log('Starting test containers');",
    )
    return replace_once(source, "new GenericContainer(`linku/rtd-tools:${RTD_TOOLS_TAG}`)", "new GenericContainer(image)")


def main() -> None:
    edit("packages/seal/test/unit/encrypt.test.ts", seal_encrypt)
    edit("packages/seal/test/unit/key-server.test.ts", seal_key_server)
    edit("packages/seal/test/unit/session-key.test.ts", seal_session)
    edit("packages/seal/test/unit/integration.test.ts", seal_integration)
    edit(
        "packages/seal/test/unit/aggregator.test.ts",
        lambda s: replace_once(s, "describe('Committee Aggregator Tests'", "describe.runIf(process.env.RTD_SEAL_LIVE === '1')('Committee Aggregator Tests'"),
    )
    edit(
        "packages/mvr-static/tests/parsing.test.ts",
        lambda s: s
        if "it.runIf(process.env.RTD_MVR_LIVE === '1')" in s
        else replace_once(
            s,
            "it('Should properly resolve packages and types in both networks'",
            "it.runIf(process.env.RTD_MVR_LIVE === '1')('Should properly resolve packages and types in both networks'",
        ),
    )
    edit(
        "packages/pas/vitest.config.mts",
        lambda s: replace_once(s, "globalSetup: ['test/e2e/globalSetup.ts'],", "globalSetup: process.env.RTD_PAS_E2E === '1' ? ['test/e2e/globalSetup.ts'] : [],"),
    )
    edit(
        "packages/pas/package.json",
        lambda s: replace_once(s, '"test:e2e": "vitest run e2e"', '"test:e2e": "RTD_PAS_E2E=1 vitest run e2e"'),
    )
    edit(
        "packages/enoki/src/wallet/wallet.ts",
        lambda s: s.replace(
            "throw new Error('OneFC OAuth requires an RTD-specific tenant endpoint');\n\t\t\t\tbreak;",
            "throw new Error('OneFC OAuth requires an RTD-specific tenant endpoint');",
        ),
    )
    old_to_new = {
        "afc3922318beb884092ce0349fae45b00cc46913dfd72247c48ad1ca890734ab": "d1ba4b7497fb97a8d23c323463a8ca14685808bcc3b06c6a8913d148ea4ecf01",
        "182cd5446391f7a5be59e6f79beb0c0ed1e3532543f82d37d8a41f13c6dae130": "6e64d1db100bb540441ed14b7f7a7f21c942cef3a8df7f6606d0fdb137c6db3a",
        "3851acd50e6a5c86fd8ae0e8acd8aee738849c10f399ac78e4c46ea0a4e8a880": "9f081fd0b8a1c18e410cd109ac2c11435afa13c5f435ed043047845923a7df0b",
        "85ae367dd0501a222f2ef6038f08cafc0c10ba2e85746e4ee15b8d1426ce1954": "54d7ab8bb2ecff82c16e3a62b241c07e5db4f4e55cc0ae34a061e3230511d04e",
    }
    edit(
        "packages/pas/test/unit/derivation.test.ts",
        lambda s: reduce(
            lambda acc, pair: replace_once(acc, *pair), old_to_new.items(), s
        ),
    )
    for path in (
        "packages/pas/test/e2e/globalSetup.ts",
        "packages/kiosk/test/e2e/globalSetup.ts",
        "packages/rtd/test/e2e/utils/globalSetup.ts",
    ):
        edit(path, docker_e2e)


if __name__ == "__main__":
    main()
