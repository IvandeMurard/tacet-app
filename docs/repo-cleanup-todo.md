# Repo cleanup — backlog

> Status: **to do** (tracked in Linear, team Tacet). Items are safe,
> non-urgent hygiene for a public portfolio repo. None of them changes
> runtime behavior.

## 1. Untrack compiled and generated files

`__pycache__/*.pyc` files are committed throughout `app/` (and `.gitignore`
only gained Python rules in July 2026). One-time fix:

```bash
git rm -r --cached $(git ls-files "*__pycache__*")
git commit -m "chore: untrack compiled pyc files"
```

## 2. Decide the fate of `tacet.db`

A binary SQLite database is tracked at the repo root. Two acceptable
outcomes, pick one:
- Rename to `demo_seed.db` + document it in the README as the demo dataset, or
- Untrack it (`git rm --cached tacet.db`) and add `*.db` to `.gitignore`,
  with `init_db.py` as the documented way to create it.

## 3. `cache/` directory

Two JSON blobs of cached OSM responses are tracked. Untrack and gitignore
(`cache/`): they are machine-generated and go stale.

## 4. `archive/` directory

Contains the pre-pivot codebases (`v1_expo_mobile`, `v2_nextjs_pwa`,
`data_pipeline`, old docs). Options: keep (it tells the pivot story honestly)
or move to a private archive repo. Low priority; if kept, add one line in the
README explaining what it is. Note: some paths in `archive/v2_nextjs_pwa`
exceed the Windows path-length limit — contributors on Windows need
`git config core.longpaths true`.

## 5. Vercel integration — why the failing check exists

The repo started life as a frontend project (see `archive/v1_expo_mobile`
and `archive/v2_nextjs_pwa`) and was connected to a Vercel project back
then. The integration survived the pivot: every push still triggers a Vercel
deployment of what is now a headless Python engine, and it fails on every
commit.

Decision to make (Vercel dashboard -> project `tacet-app` -> Settings -> Git):
- **Disconnect** the GitHub integration (recommended while `ui/` is not an
  active showcase), or
- Keep it and set **Root Directory = `ui/`** so it deploys the Vite dashboard
  as a live preview.

Until then the red "Vercel" check on PRs can be ignored; `lint` and `test`
are the required checks.

## 6. Minor

- `.vscode/` is tracked — harmless, but `.gitignore` it if editor settings
  churn.
- `REFACTOR_ROAST_001.md` and `URBAN_ISR_MANIFESTO.md` in `docs/` predate the
  July 2026 repositioning (hospitality vocabulary, honest claims) — review or
  archive them.
