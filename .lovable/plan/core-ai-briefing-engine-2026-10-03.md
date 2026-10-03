# Core AI Briefing Engine

## Goal

Build the intelligence layer behind Brief while preserving its current visual design, navigation, settings, and mock-only foundation.

## Implementation

- Replace the current formatter with a typed `briefingEngine` that accepts date/time, calendar events, tasks, optional weather, news, preferences, and a morning/evening type.
- Return one stable briefing object for both periods, including ranked priorities, calendar, weather, news, concise insight, completion state, tomorrow preview, and generation metadata.
- Add deterministic importance scoring for time proximity, deadlines, explicit importance, relevance, and consequences. High-stakes categories will be surfaced as facts, never decided for the user.
- Generate concise natural Bulgarian or English only from supplied facts, with explicit natural fallbacks when information is missing.
- Expand the mock source layer with realistic Bulgarian today/tomorrow events, tasks, weather, and news that can produce both briefing types.
- Add separate morning/evening cache keys scoped by date, timezone, briefing language, and input content so unchanged briefings are reused safely.
- Resolve briefing language independently from interface language in the app provider.
- Make the existing Dynamic Briefing Pill clickable and show the selected generated briefing. Add a discreet development-only morning/evening switch, without changing the device clock or exposing it in production.
- Adapt existing cards to the stable engine output without redesigning them; missing weather and empty lists will render safely.

## Verification

- Add focused tests for morning, evening, Bulgarian, English, empty data, multiple calendar events, multiple news items, no tasks, no weather, importance ranking, and cache separation/reuse.
- Run existing and new tests, then verify the live phone layout, pill behavior, independent language selection, overflow, console errors, and the latest build status.

## Technical Notes

- Keep raw source data, engine logic, localization dictionaries, and React presentation separate.
- Keep generation synchronous and deterministic for now; the engine contract and cache boundary will allow a real AI provider and external data adapters later.
- No external APIs, authentication, database, service worker, or visual redesign.