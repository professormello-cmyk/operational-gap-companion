# Operational Gap Companion

**Operational Gap Companion** is a lightweight static client-side web application for operational-gap diagnostics in inorganic electronic-state assignment.

The application is intended for rapid inspection of local state competition, near-degeneracy corridors, two-state mixing, and assignment robustness under chemically relevant control variables.

## Public deployment

The public GitHub Pages deployment is available at:

```text
https://professormello-cmyk.github.io/operational-gap-companion/
```

A campaign-tagged access URL may be used for manuscript-linked or QR-based access tracking:

```text
https://professormello-cmyk.github.io/operational-gap-companion/?utm_source=polyhedron&utm_medium=qr&utm_campaign=operational_gap_companion
```

## Main purpose

The main purpose of the application is to provide a compact and usable diagnostic companion for:

- operational-gap analysis;
- 2×2 state-mixing inspection;
- chemically sensitive assignment changes;
- element-based preset loading from the periodic table.

The application is designed as an interpretive companion to the manuscript framework. It does not replace spectroscopy, multistate electronic-structure calculations, or detailed chemical modelling.

## Current features

- clickable periodic table in standard layout;
- editable diagnostic presets for each element;
- 2×2 calculator using Δ, V, Δop, and T;
- automatic evaluation of R, sin²φ, Δadiab, Δmin, kBT, and corridor class;
- short diagnostic interpretation in English;
- lightweight static deployment through GitHub Pages;
- offline support through Progressive Web App behaviour;
- aggregate access counting through GoatCounter in the public deployment.

## Scope

The application is intended as a compact technical companion for inorganic chemistry, especially in cases involving:

- spin-state competition;
- charge-transfer competition;
- relativistic and spin-orbit-sensitive reordering;
- operationally fragile electronic-state assignments;
- local electronic-state assignment under chemically relevant control variables.

The application does not reconstruct a full electronic structure. Its role is to organize reduced diagnostic quantities that help distinguish robust electronic assignments from fragile or locally valid ones.

## Diagnostic quantities

The current diagnostic layer evaluates the following reduced quantities:

```text
R = |Δ| / |V|

sin²φ = 1/2 · (1 - Δ / sqrt(Δ² + 4V²))

Δadiab = sqrt(Δ² + 4V²)

Δmin = 2|V|

kBT (eV) = 8.617333262×10⁻5 · T
```

The corridor class is assigned from the reduced energetic clearance and mixing scale:

```text
CRS = 0 if Δop ≥ 0.5 and R ≥ 5

CRS = 1 if Δop ≥ 0.2 and R ≥ 2

CRS = 2 if Δop ≥ 0.1 and R ≥ 1

CRS = 3 otherwise
```

These classes are intended as compact operational indicators, not as substitutes for full electronic-structure analysis.

## Deployment

This project is deployed as a static site and is compatible with GitHub Pages.

The deployed application consists of static HTML, CSS, JavaScript, manifest, icon, and data assets. Diagnostic calculations are performed client-side in the browser.

## Analytics and access counting

The public deployment includes privacy-friendly aggregate access counting through GoatCounter.

This analytics layer is used only to monitor public access to the deployed companion application. It is separate from the diagnostic calculation layer and is not required for the core functionality of the app.

The GoatCounter script is used only for access analytics. It is not part of the operational-gap calculation layer.

## Security and architecture note

The public application is distributed as a static client-side web tool composed of HTML, CSS, JavaScript, manifest, icon, and data assets.

In the present implementation:

- no server-side executable component is used for the diagnostic application;
- no binary installer is distributed;
- diagnostic calculations are performed locally in the browser;
- element presets are loaded from static data assets;
- offline behaviour is handled locally through a same-origin service worker;
- aggregate access counting is provided through GoatCounter in the public deployment.

This description refers to the public source version and its corresponding static deployment.

## Project identity

**Name:** Operational Gap Companion

**Short name:** Δop

**Core idea:** a periodic-table-based diagnostic companion for operational-gap analysis in inorganic electronic-state assignment.

## Versioning recommendation

For citation, reproducibility, and manuscript use, released versions should be tagged explicitly in the repository so that a fixed public version can be identified and audited.

Recommended release practice:

- tag stable public versions, for example `v1.0.0`, `v1.0.1`, etc.;
- describe each release in terms of diagnostic changes, interface changes, data changes, and deployment changes;
- keep manuscript-linked versions frozen when cited;
- use later tagged releases for incremental improvements.

## Next development target

The next development step is the refinement of installability, version-auditable deployment, and improved diagnostic documentation for the static Progressive Web App release.

Near-term targets include:

- clearer release notes for each tagged version;
- improved formula-audit documentation;
- expanded element presets;
- optional additional campaign URLs for different publications or dissemination channels;
- preservation of a stable manuscript-linked version for reproducibility.s the refinement of installability, icon identity, and released-version auditability for the static Progressive Web App deployment.
