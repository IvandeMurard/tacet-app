# From 2D to 3D acoustics — implementation roadmap

> Status: **design target, not implemented** (tracked in Linear, team Tacet).
> Today the engine does 2D footprint ray-casting: a building either blocks the
> line of sight (flat -15 dB penalty) or it doesn't. Heights are already
> fetched but unused. This document describes the shortest path to real 3D.

## What already exists (the hooks)

- `app/services/spatial.py` returns `height_meters` for every building:
  explicit OSM `height` tag, else `building:levels` x 3.5 m, else a Parisian
  fallback of 17.5 m (5 stories). **The data is already in the pipeline.**
- `app/services/acoustic_engine.py` builds a polar heatmap (360 rays) caching
  the distance to the nearest obstacle per compass degree. It ignores
  `height_meters` entirely, and `get_shielding_penalty` returns a binary
  0 / 15 dB.

## Step 1 — Extend the polar cache with obstacle height (~0.5 day)

Change the heatmap value from `distance` to `(distance, obstacle_height)`.
`build_acoustic_heatmap` already iterates the buildings; keep the height of
whichever building produced `min_obstacle_dist`. Bump the in-memory cache
format and the tests.

## Step 2 — Replace the binary penalty with barrier diffraction (~1 day)

Sound doesn't stop at a wall, it diffracts over the top. The standard
engineering approximation is **Maekawa's formula**:

```
N = 2 * delta / lambda          # Fresnel number
attenuation_dB = 10 * log10(3 + 20 * N)   for N > 0, capped at ~24 dB
```

where `delta` is the path-length difference between the diffracted path
(source -> building top edge -> receiver) and the direct path, and `lambda`
is the wavelength (~0.7 m at 500 Hz, a reasonable single-band choice for
construction/crowd noise; a 3-band version at 250/500/2000 Hz is the refined
option).

`delta` is pure geometry from things we have: event distance, obstacle
distance (cache), obstacle height (step 1), source height (assume 1.5 m for
crowds, 3 m for construction machinery) and receiver height (step 3). A tall
building close to the hotel gives a large `delta` (strong shadow); a low wall
far away gives almost none. This replaces the flat 15 dB with a physically
defensible 5-24 dB range.

## Step 3 — Per-floor receiver height = the business payoff (~1-2 days)

Compute the attenuation per floor (receiver at `floor * 3 m + 1.5 m`):

- Low floors sit deep in the acoustic shadow of the obstacle -> protected.
- High floors rise above the shadow (`delta` shrinks, can reach line of
  sight) -> exposed.

Expose it as `get_room_risk_score(room_category, floor, date)` on the API and
the MCP server. **This is the feature the RMS actually wants**: price the
2nd-floor street-facing rooms differently from the 6th floor during the same
disruption. Nobody prices per compass bearing; everybody prices per room
category and floor.

## Step 4 — Field validation (~0.5 day)

Before claiming 3D physics publicly: pick one active construction site in
Paris, take 3 smartphone SPL measurements (NIOSH SLM app or equivalent) at
street level and behind a shielding building, compare with the model output,
and publish the deltas in this doc. A validated simple model beats an
unvalidated sophisticated one.

## Non-goals (for now)

- Full ray-tracing with reflections (urban canyon effects): large effort,
  second-order impact vs. diffraction.
- Ground absorption / weather refraction: below the noise floor of our input
  data quality.
- 3D city meshes (LoD2): OSM heights are sufficient until step 4 proves
  otherwise.
