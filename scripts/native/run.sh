#!/usr/bin/env bash
# Build, install and launch the iOS app on a simulator.
# Usage: bun ios            -> default simulator (iPhone 17)
#        SIM="iPhone 17 Pro" bun ios
set -euo pipefail
cd "$(dirname "$0")/../../apps/native"

SIM="${SIM:-iPhone 17}"
BUNDLE_ID="com.betterfullstack.app"
SCHEME="BetterFullstackApp"
DERIVED="build"

# Resolve simulator UDID by name (first available match)
UDID=$(xcrun simctl list devices available | grep -F "    $SIM (" | head -1 | sed -E 's/.*\(([0-9A-F-]{36})\).*/\1/')
if [ -z "$UDID" ]; then
  echo "Simulator \"$SIM\" not found. Available:" >&2
  xcrun simctl list devices available | grep -E '^\s+iP' >&2
  exit 1
fi

echo "→ Generating Xcode project"
xcodegen generate --quiet

echo "→ Booting $SIM ($UDID)"
xcrun simctl boot "$UDID" 2>/dev/null || true
open -b com.apple.iphonesimulator 2>/dev/null || true

echo "→ Building $SCHEME"
xcodebuild -scheme "$SCHEME" -sdk iphonesimulator \
  -destination "id=$UDID" -derivedDataPath "$DERIVED" -quiet build

echo "→ Installing and launching"
xcrun simctl install "$UDID" "$DERIVED/Build/Products/Debug-iphonesimulator/$SCHEME.app"
xcrun simctl launch --terminate-running-process "$UDID" "$BUNDLE_ID"
