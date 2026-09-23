#!/usr/bin/env python3
"""In-place RTD fork of the current upstream TS SDK monorepo.

The 2025 scripts copied a fixed set of packages between obsolete absolute
paths.  Current upstream has nested workspaces and many new packages, so this
script transforms the complete checkout while keeping its current build graph.
"""

from __future__ import annotations

import re
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
EXCLUDED = {".git", "node_modules", "dist", "typedoc", ".next", ".turbo", "coverage", "fork-ts-instruct"}
BINARY_SUFFIXES = {".wasm", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".ico", ".woff", ".woff2", ".pdf", ".zip", ".tgz"}
NETWORKS = {
    "fullnode.mainnet.sui.io": "fullnode.mainnet.rtd.life",
    "fullnode.testnet.sui.io": "fullnode.testnet.rtd.life",
    "fullnode.devnet.sui.io": "fullnode.devnet.rtd.life",
    "faucet.testnet.sui.io": "faucet.testnet.rtd.life",
    "faucet.devnet.sui.io": "faucet.devnet.rtd.life",
}
BECH32_ALPHABET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l"
BECH32_KEY = re.compile(rf"\b(?:sui|rtd)privkey1([{BECH32_ALPHABET}]{{59}})\b")
ENCODED_LITERAL = re.compile(r'''(?P<q>["'`])(?P<data>[A-Za-z0-9_+\-/]{80,}={0,2})(?P=q)''')


def reencode_private_key(match: re.Match[str]) -> str:
    # 33 payload bytes -> 53 five-bit digits; the final six digits are the
    # checksum, which commits to the human-readable prefix.
    payload = match.group(1)[:-6]
    hrp = "rtdprivkey"
    values = [ord(char) >> 5 for char in hrp] + [0] + [ord(char) & 31 for char in hrp]
    values += [BECH32_ALPHABET.index(char) for char in payload] + [0] * 6
    checksum = 1
    generators = (0x3B6A57B2, 0x26508E6D, 0x1EA119FA, 0x3D4233DD, 0x2A1462B3)
    for value in values:
        top = checksum >> 25
        checksum = ((checksum & 0x1FFFFFF) << 5) ^ value
        for bit, generator in enumerate(generators):
            if (top >> bit) & 1:
                checksum ^= generator
    checksum ^= 1  # BIP-173 Bech32, not Bech32m.
    suffix = "".join(BECH32_ALPHABET[(checksum >> (5 * (5 - index))) & 31] for index in range(6))
    return f"{hrp}1{payload}{suffix}"


def replace_brand(value: str) -> str:
    value = BECH32_KEY.sub(reencode_private_key, value)
    # Regex literals escape the package slash, so handle those before normal
    # package-specifier replacement.
    value = value.replace("@mysten\\/sui", "rtd-typescript")
    value = value.replace("@linku\\/rtd", "rtd-typescript")
    value = value.replace("MystenLabs/ts-sdks", "LinkUVerse/rtd-ts-sdk")
    value = value.replace("mystenlabs/ts-sdks", "linkuverse/rtd-ts-sdk")
    value = value.replace("LinkUVerse/ts-sdks", "LinkUVerse/rtd-ts-sdk")
    value = value.replace("linkuverse/ts-sdks", "linkuverse/rtd-ts-sdk")
    value = value.replace("usdsui", "usdrtd")
    value = value.replace("%3A%3Asui%3A%3A", "%3A%3Artd%3A%3A")
    for old, new in NETWORKS.items():
        value = value.replace(old, new)

    # Existing RTD consumers use the unscoped rtd-* package names.  Map the
    # core SDK to its established rtd-typescript name, including subpaths.
    value = re.sub(r"@mysten/sui(?=/|[^A-Za-z0-9_.-]|$)", "rtd-typescript", value)
    value = re.sub(
        r"@mysten(?:-incubation)?/([A-Za-z0-9_.-]+)",
        lambda match: "rtd-" + replace_brand(match.group(1)),
        value,
    )
    value = value.replace("MystenLabs", "LinkUVerse")
    value = value.replace("mystenlabs", "linkuverse")
    value = value.replace("Mysten", "LinkU")
    value = value.replace("mysten", "linku")
    value = value.replace("SUI", "RTD")
    value = re.sub(r"Sui(?!t(?:e|able|ability|s)?\b)", "Rtd", value)
    # Do not rewrite pursuit, suitable, suite, suits, suicide, or suing.
    value = re.sub(r"(?<![A-Za-z])sui(?!t(?:e|able|ability|s)?\b|cid|ng\b)", "rtd", value)
    return value


def replace_line(line: str) -> str:
    protected: dict[str, str] = {}

    def stash(match: re.Match[str]) -> str:
        marker = f"__ENCODED_LITERAL_{len(protected)}__"
        protected[marker] = match.group(0)
        return marker

    out = ENCODED_LITERAL.sub(stash, line)
    out = replace_brand(out)
    for marker, literal in protected.items():
        out = out.replace(marker, literal)
    return out


def main() -> None:
    if subprocess.check_output(["git", "-C", str(ROOT), "rev-parse", "--show-toplevel"], text=True).strip() != str(ROOT):
        raise SystemExit("Run only inside the TS SDK checkout")
    if not (ROOT / "pnpm-workspace.yaml").exists():
        raise SystemExit("Unexpected TS SDK layout")

    edited = 0
    files = sorted(p for p in ROOT.rglob("*") if p.is_file() and not EXCLUDED.intersection(p.relative_to(ROOT).parts))
    for path in files:
        if path.name == "pnpm-lock.yaml" or path.suffix.lower() in BINARY_SUFFIXES:
            continue
        raw = path.read_bytes()
        if b"\0" in raw:
            continue
        try:
            old = raw.decode("utf-8")
        except UnicodeDecodeError:
            continue
        new = "".join(
            line if len(line.strip()) > 256 and re.fullmatch(r"[A-Za-z0-9+/=]+", line.strip())
            else replace_line(line)
            for line in old.splitlines(keepends=True)
        )
        if new != old:
            path.write_bytes(new.encode("utf-8"))
            edited += 1

    renamed = 0
    paths = sorted((p for p in ROOT.rglob("*") if not EXCLUDED.intersection(p.relative_to(ROOT).parts)), key=lambda p: (len(p.relative_to(ROOT).parts), str(p)), reverse=True)
    for path in paths:
        if not path.exists():
            continue
        name = replace_brand(path.name)
        if name == path.name:
            continue
        destination = path.with_name(name)
        if destination.exists():
            raise SystemExit(f"Path collision: {path} -> {destination}")
        path.rename(destination)
        renamed += 1

    # Reown 1.8.23's public Config accepts arbitrary namespace strings and its
    # runtime forwards them to WalletConnect, but its CAIP network type is
    # restricted to built-in namespaces. Keep RTD on the wire and confine the
    # compatibility assertion to this one adapter boundary.
    wallet = ROOT / "packages/walletconnect-wallet/src/wallet/index.ts"
    if wallet.is_file():
        source = wallet.read_text()
        source = source.replace(
            "\t\t\t\t\tchains: RTDCaipNetworks,",
            "\t\t\t\t\t// Reown's type omits custom RTD namespaces; UniversalConnector forwards them.\n"
            "\t\t\t\t\tchains: RTDCaipNetworks as unknown as CustomCaipNetwork[],",
        )
        source = source.replace("`https://rtd-${chainId}.gateway.tatum.io`", "`https://fullnode.${chainId}.rtd.life`")
        wallet.write_text(source)

    enoki = ROOT / "packages/enoki/src/wallet/wallet.ts"
    if enoki.is_file():
        source = enoki.read_text()
        source = re.sub(
            r"oauthUrl = `https://login\.onepassport\.onefc\.com/[^`]*onesuizklogin[^`]*`;",
            "throw new Error('OneFC OAuth requires an RTD-specific tenant endpoint');",
            source,
        )
        enoki.write_text(source)

    # Upstream's Markdown code sample used spaces before a tab; after the
    # renamed lines become additions, Git correctly reports those as errors.
    for changelog in (ROOT / "packages/zksend/CHANGELOG.md", ROOT / "packages/rtd/CHANGELOG.md"):
        if changelog.is_file():
            source = changelog.read_text()
            changelog.write_text(source.replace("  \t", "    "))

    # Signed Seal vectors and network tests need explicit migration. Pure text
    # replacement cannot preserve their cryptographic semantics.
    subprocess.run(
        ["python3", str(ROOT / "fork-ts-instruct/v2/repair-current-upstream-tests.py")],
        check=True,
    )

    print(f"Rebranded {edited} UTF-8 files and renamed {renamed} paths")
    print("Next: regenerate pnpm-lock.yaml, install dependencies, then pnpm build")


if __name__ == "__main__":
    main()
