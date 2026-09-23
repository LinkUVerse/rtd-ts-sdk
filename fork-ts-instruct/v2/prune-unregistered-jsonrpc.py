#!/usr/bin/env python3
"""Remove JSON-RPC client calls absent from the current RTD fullnode contract.

This patch is pinned to the 2026-09 TS SDK refresh. Recheck the current
OpenRPC spec before carrying it to a newer upstream revision.
"""

from __future__ import annotations

import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
PATCH = Path(__file__).with_suffix(".patch")
CLIENT = ROOT / "packages/typescript/src/jsonRpc/client.ts"
UNREGISTERED = (
    "rtdx_getNetworkMetrics",
    "rtdx_getLatestAddressMetrics",
    "rtdx_getEpochMetrics",
    "rtdx_getAllEpochAddressMetrics",
    "rtdx_getEpochs",
    "rtdx_getMoveCallMetrics",
    "rtdx_getCurrentEpoch",
)


def main() -> None:
    source = CLIENT.read_text()
    present = [name for name in UNREGISTERED if f"method: '{name}'" in source]
    if not present:
        print("JSON-RPC contract pruning already applied")
        return
    if len(present) != len(UNREGISTERED):
        raise SystemExit(f"Partial or changed upstream contract: {present}")

    subprocess.run(
        ["git", "-C", str(ROOT), "apply", "--unidiff-zero", "--check", str(PATCH)],
        check=True,
    )
    subprocess.run(["git", "-C", str(ROOT), "apply", "--unidiff-zero", str(PATCH)], check=True)

    source = CLIENT.read_text()
    remaining = [name for name in UNREGISTERED if f"method: '{name}'" in source]
    if remaining or "method: 'rpc.discover'" not in source:
        raise SystemExit(f"JSON-RPC contract verification failed: {remaining}")
    print("Removed 7 unregistered JSON-RPC calls and their unused response types")


if __name__ == "__main__":
    main()
