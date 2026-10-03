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
