#!/usr/bin/env python3
"""Keep the current upstream SDK packages that exist in the previous RTD fork.

Run after refresh-current-upstream.py and before regenerating pnpm-lock.yaml.
The previous fork is read only; this checkout is the only mutation target.
"""

from __future__ import annotations

import json
import re
import shutil
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
REFERENCE = ROOT.parent.parent / "rtd-ts-sdk"
KEEP = {
    "bcs",
    "build-scripts",
    "dapp-kit",
    "kiosk",
    "slush-wallet",
    "typescript",
    "utils",
    "wallet-standard",
    "window-wallet-core",
}
OBSOLETE_WORKFLOWS = {
    "deepbook-v3-e2e.yml",
    "hashi-ci.yml",
    "pas-ci.yml",
    "seal-ci.yml",
    "telegram-notify.yml",
}


def write_json(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent="\t") + "\n")


def main() -> None:
    if ROOT.resolve() == REFERENCE.resolve():
        raise SystemExit("The reference fork must remain read only")
    reference_packages = REFERENCE / "packages"
    if {p.name for p in reference_packages.iterdir() if p.is_dir()} != KEEP:
        raise SystemExit("Reference package directories changed; review the allowlist")

    packages = ROOT / "packages"
    if (packages / "rtd").is_dir():
        if (packages / "typescript").exists():
            raise SystemExit("Both packages/rtd and packages/typescript exist")
        (packages / "rtd").rename(packages / "typescript")
    if not (packages / "typescript").is_dir():
        raise SystemExit("Core TypeScript package is missing")
    for path in packages.iterdir():
        if path.is_dir() and path.name not in KEEP:
            shutil.rmtree(path)

    tracked = subprocess.check_output(
        ["git", "-C", str(REFERENCE), "ls-files", "packages/build-scripts"], text=True
    ).splitlines()
    for relative in tracked:
        destination = ROOT / relative
        if not destination.exists():
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(REFERENCE / relative, destination)

    build_tsconfig = packages / "build-scripts/tsconfig.json"
    source = build_tsconfig.read_text()
    if '"types": ["node"]' not in source:
        build_tsconfig.write_text(
            source.replace('"moduleResolution": "NodeNext",',
                           '"moduleResolution": "NodeNext",\n\t\t"types": ["node"],')
        )

    workspace = ROOT / "pnpm-workspace.yaml"
    content = workspace.read_text().replace("packages/rtd/", "packages/typescript/")
    content = "\n".join(
        line
        for line in content.splitlines()
        if not (
            match := re.search(r"!packages/([^/'\"]+)", line)
        ) or match.group(1) in KEEP
    )
    workspace.write_text(content + "\n")

    graphql_config = ROOT / "graphql.config.ts"
    graphql_config.write_text(
        graphql_config.read_text()
        .replace("packages/rtd/", "packages/typescript/")
        .replace("graphql/generated/latest/schema.graphql", "graphql/generated/schema.graphql")
    )
    for path in (
        packages / "dapp-kit/packages/dapp-kit-core/vitest.config.mts",
        packages / "kiosk/vitest.unit.config.mts",
        packages / "kiosk/vitest.config.mts",
    ):
        path.write_text(path.read_text().replace("rtd/src", "typescript/src"))
    oxlint = ROOT / ".oxlintrc.json"
    config = json.loads(oxlint.read_text())
    config["ignorePatterns"] = [
        item.replace("packages/rtd/", "packages/typescript/")
        for item in config["ignorePatterns"]
        if not (
            item.startswith("packages/")
            and (segment := item.split("/")[1]) not in KEEP
            and segment != "*"
        )
    ]
    write_json(oxlint, config)

    turbo_path = ROOT / "turbo.json"
    turbo = json.loads(
        "\n".join(
            line for line in turbo_path.read_text().splitlines()
            if not line.lstrip().startswith("//")
        )
    )
    tasks = turbo["tasks"]
    for name in ("test", "test:e2e"):
        tasks[name].pop("env", None)
    for name in list(tasks):
        if name == "build:docs" or (
            "#" in name and name.split("#", 1)[0] not in package_names(packages)
        ):
            del tasks[name]
    tasks["build"]["dependsOn"] = [
        item for item in tasks["build"]["dependsOn"] if item != "build:docs"
    ]
    tasks["build"]["outputs"] = [
        item for item in tasks["build"]["outputs"] if item != "docs/**"
    ]
    write_json(turbo_path, turbo)

    for path in packages.rglob("turbo.json"):
        if "node_modules" in path.parts:
            continue
        config = json.loads(path.read_text())
        for task in config.get("tasks", {}).values():
            if "dependsOn" in task:
                task["dependsOn"] = [
                    item for item in task["dependsOn"] if item != "build:docs"
                ]
        write_json(path, config)

    for path in packages.rglob("package.json"):
        if any(part in path.parts for part in ("node_modules", "dist", ".next")):
            continue
        data = json.loads(path.read_text())
        if not data.get("name"):
            continue
        data.get("scripts", {}).pop("build:docs", None)
        if data["name"] == "rtd-kiosk":
            data["scripts"].pop("codegen", None)
            data.get("devDependencies", {}).pop("rtd-codegen", None)
        if data["name"] == "rtd-build-scripts":
            data["devDependencies"]["typescript"] = "^7.0.2"
            data["dependencies"]["@types/node"] = "^26.2.0"
            scripts = data["scripts"]
            scripts.pop("eslint:check", None)
            scripts.pop("eslint:fix", None)
            scripts.update({
                "oxlint:check": "oxlint .",
                "oxlint:fix": "oxlint --fix .",
                "lint": "pnpm run oxlint:check && pnpm run prettier:check",
                "lint:fix": "pnpm run oxlint:fix && pnpm run prettier:fix",
            })
        write_json(path, data)

    (packages / "kiosk/rtd-codegen.config.ts").unlink(missing_ok=True)
    workflows = ROOT / ".github/workflows"
    names = package_names(packages)
    for path in workflows.glob("release-*.yml"):
        match = re.search(r"package: '([^']+)'", path.read_text())
        if match and match.group(1) not in names:
            path.unlink()
    for name in OBSOLETE_WORKFLOWS:
        (workflows / name).unlink(missing_ok=True)
    for name in ("release-rtd.yml", "_release-package.yml"):
        path = workflows / name
        path.write_text(path.read_text().replace("packages/rtd", "packages/typescript"))

    actual = {p.name for p in packages.iterdir() if p.is_dir()}
    if actual != KEEP:
        raise SystemExit(f"Package directories differ from reference: {actual ^ KEEP}")
    print(f"Retained {len(KEEP)} top-level package directories")
    print("Next: regenerate the lockfile, install, format, then build and test")


def package_names(packages: Path) -> set[str]:
    names = set()
    for path in packages.rglob("package.json"):
        if any(part in path.parts for part in ("node_modules", "dist", ".next")):
            continue
        name = json.loads(path.read_text()).get("name")
        if name:
            names.add(name)
    return names


if __name__ == "__main__":
    main()
