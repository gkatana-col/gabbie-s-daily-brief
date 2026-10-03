# Brief — Android integration guide

## Current architecture (PWA)
Brief is a manifest-only installable web app (TanStack Start + React). Layers:
`mock/source data → briefingEngine / discoverEngine → UI components`. `briefingScheduler`
(`src/features/briefing/briefingScheduler.ts`) decides the active period; `briefingEngine` produces the briefing.
Both stay the source of truth for every surface (screens, home widget, Now Bar).

## Native abstraction layer — `src/features/native/`
```text
Brief PWA → NativeBridge → (future) Capacitor / Android → Android native services
```
- `types.ts` — contracts: `NativeBridge`, `NowBarContent`, `NowBarAdapter`, `HealthDataProvider`,
  `NativeCalendarProvider`, `NativeNotificationProvider`, `PlatformCapabilities`.
- `nativeBridge.ts` — `webNativeBridge` (safe defaults: `isNativeApp() = false`, platform `web`,
  permissions resolve `false`, Now Bar / native screens are no-ops). `nativeBridge` wraps the active bridge
  and swallows rejections so the web app never crashes when no native layer exists.
  A native wrapper injects its implementation with `setNativeBridge(bridge)` at startup.
- `platformCapabilities.ts` — `getPlatformCapabilities()`; on the web every native capability is `false`.
- `providers.ts` — web implementations: `WebNowBarAdapter` (stores last state, shows nothing),
  `BridgeNowBarAdapter` (future: forwards to the bridge when supported), `unavailableHealthDataProvider`,
  `mockNativeCalendarProvider` (existing mock calendar), `unsupportedNotificationProvider`.
- `nowBarMapping.ts` — pure `briefingToNowBarContent(briefing, period, language, now)`:
  morning ("Добро утро · Твоят ден · 3 важни неща днес"), next event within 60 min
  ("Следващо събитие · Университет · След 30 мин"), evening ("Вечерен обзор · Как мина денят?").
- `NowBarSync.tsx` — invisible component in the root layout; pushes the mapped state to the adapter whenever
  the briefing changes. On the web this does nothing visible.

## Connecting a future Android app
1. Wrap the PWA with Capacitor (not installed yet).
2. Write a Capacitor plugin (Kotlin) exposing the `NativeBridge` methods; implement a TS `NativeBridge` that
   calls it and register it via `setNativeBridge()` before the app renders.
3. Swap `nowBarAdapter` for `BridgeNowBarAdapter`. Only enable `supportsNowBar` if an official, publicly
   documented Android/Samsung API for ongoing/live surfaces is used (e.g. Android ongoing notifications /
   Live Updates). No root, Shizuku, firmware or system hacks.
4. Calendar: `Android CalendarContract → plugin → NativeCalendarProvider → briefingEngine input`.
   Request `READ_CALENDAR` only from an explicit user action.
5. Health: `Samsung Health / Health Connect → Android companion → HealthDataProvider → Brief`.
   Request Health Connect permissions per data type, only after explicit opt-in; never infer sensitive traits.
6. Notifications: implement `NativeNotificationProvider` with Android notification channels; respect the
   existing notification settings (morning, important updates, evening).
7. Home widget: build a native Glance/AppWidget that consumes the same `BriefWidgetData` contract.

## Currently web-only
Everything: briefings, Discover, calendar (mock data), home widget preview, settings. No native permissions,
notifications, health data, calendar access or Now Bar output exist in the PWA.

## Rules
- The web app must never import Android/Capacitor APIs directly — only through `NativeBridge` and providers.
- Do not copy or hardcode Samsung proprietary APIs, assets, icons or branding into the PWA.
- Never show fake system notifications or a simulated Now Bar in the web app.
