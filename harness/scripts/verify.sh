#!/usr/bin/env bash
# 一键验证门禁：没有验证，就没有完成（harness/rules.md §6）。
set -euo pipefail
cd "$(dirname "$0")/../.."

echo "==> typecheck" && npm run -s typecheck
echo "==> lint"      && npm run -s lint
echo "==> test"      && npm run -s test
echo "==> build:weapp"
# Taro 缓存写 ~/.taro4.0；沙箱/CI 中将 HOME 收敛进仓库（见 harness/memory.md）
HOME_DIR="${TARO_HOME_OVERRIDE:-$PWD/.home}"
mkdir -p "$HOME_DIR"
HOME="$HOME_DIR" npm run -s build:weapp

echo "==> ALL GREEN"
