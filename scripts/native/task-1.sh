#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/../.."
(cd 'apps/native' && xcodegen generate)
