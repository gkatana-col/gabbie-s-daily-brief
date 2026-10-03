# Gabbie Brief foundation

## What I’ll build
- Replace the placeholder with a polished, mobile-first Bulgarian briefing dashboard using the requested calm premium visual direction.
- Add five working sections: Home, Today, News, Calendar, and Settings, all reachable through persistent bottom navigation.
- Create reusable cards for greeting, daily summary, priorities, calendar, weather, news, insight, and evening recap.
- Add a complete Bulgarian/English translation system with instant interface switching, Automatic mode, localized dates, and no interface copy embedded directly in components.
- Build Settings controls for interface language, briefing language, theme preference, and the three notification preferences.
- Add lightweight home-screen install metadata and Android-focused app icons, without offline caching or external services.

## Data and AI foundation
- Define typed User, Briefing, raw-source, and AI-output models.
- Add a standalone `briefingEngine` that converts structured mock calendar, weather, news, tasks, and preferences into a mock daily briefing.
- Keep raw mock data, briefing processing, and visual components separate so real Lovable AI and external integrations can replace the mock layer later.

## Quality checks
- Add focused tests for language switching and briefing-engine output.
- Verify the live app at phone and desktop sizes, including navigation, overflow, spacing, accessible control names, console errors, and translated visible copy.
- Add unique page metadata for every section.

## Technical details
- Use the existing TanStack Start, React 19, TypeScript, Tailwind v4, and Lucide stack.
- Use semantic design tokens for color, typography, shadows, and theme behavior.
- Keep preferences in browser state for this mock-only foundation; no authentication, payments, external APIs, database, or offline service worker.
