# EventsHub iOS app

Native SwiftUI application for iPhone and iPad. Generate the (gitignored) Xcode project from the deterministic XcodeGen spec, then build it:

```bash
xcodegen generate
xcodebuild -project EventsHub.xcodeproj -scheme EventsHub -sdk iphonesimulator build
```

## Device builds

The simulator needs no extra setup. To build on a physical device, set your Apple team ID locally (the file is gitignored):

```bash
cp Config/Local.xcconfig.example Config/Local.xcconfig
# edit Config/Local.xcconfig and replace YOUR_TEAM_ID
xcodegen generate
```
