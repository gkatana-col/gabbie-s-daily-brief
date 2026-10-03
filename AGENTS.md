<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep localization dictionaries, structured source data, briefing processing, and presentation components separate so future AI and API integrations can replace mocks without changing the UI.
- Treat Brief as a manifest-only installable web app; do not add an app-shell service worker unless offline behavior is explicitly requested.
- Keep the Briefing Engine deterministic and provider-agnostic behind a stable structured input/output contract so mock adapters can later be replaced without UI changes.
- Render interface iconography through the shared Brief icon component so navigation, cards, and settings retain one consistent line-icon language.
- Keep home-widget presentation prop-driven and browser-neutral behind BriefWidgetDataProvider so a future native client can reuse the same conceptual contract.
- Discover is a separate module (src/features/discover): sources come only through a DiscoverFeedProvider, ranking/summaries live in discoverEngine, and briefingEngine receives at most a few ranked stories as plain news input — so real RSS/API providers can replace the mock without UI changes.
