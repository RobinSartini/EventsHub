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

## API configuration

The API base URL and the `Origin` header come from build settings (`project.yml`, overridable in `Config/Local.xcconfig`):

- `EVENTS_API_BASE_URL` (Debug: `http://localhost:3001`)
- `EVENTS_API_ORIGIN` (Debug: `http://localhost:3000`): sent as `Origin` on every request. Better Auth rejects session-cookie requests without it, and it must equal the server's `CORS_ORIGIN`. Empty in Release: set it per environment.

Defaults match the docker stack (`docker compose`: API on `3001`, `CORS_ORIGIN=http://localhost:3000`). With a server started another way (for example `bun dev`, where `apps/server/.env` sets `CORS_ORIGIN=http://localhost:5173`), override both values in `Config/Local.xcconfig` so that `EVENTS_API_ORIGIN` equals that server's `CORS_ORIGIN`. A missing or wrong origin makes authenticated requests fail with a 403.
