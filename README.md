# Operational Gap Companion

Operational Gap Companion is a lightweight static client-side web application for operational-gap diagnostics in inorganic electronic-state assignment.

The application is intended for rapid inspection of local state competition, near-degeneracy corridors, two-state mixing, and assignment robustness under chemically relevant control variables.

## Main purpose

The main purpose of the application is to provide a compact and usable diagnostic companion for:

- operational-gap analysis
- 2×2 state-mixing inspection
- chemically sensitive assignment changes
- element-based preset loading from the periodic table

## Current features

- clickable periodic table in standard layout
- editable diagnostic presets for each element
- 2×2 calculator using Δ, V, Δop, and T
- short diagnostic interpretation in English
- lightweight static deployment
- offline support through Progressive Web App behaviour

## Scope

The application is intended as a compact technical companion for inorganic chemistry, especially in cases involving:

- spin-state competition
- charge-transfer competition
- relativistic and spin-orbit-sensitive reordering
- operationally fragile electronic-state assignments

The application does not replace full electronic-structure calculations. It is intended as a rapid interpretive and diagnostic layer.

## Deployment

This project is deployed as a static site and is compatible with GitHub Pages.

## Security and architecture note

The public application is distributed as a static client-side web tool composed of local HTML, CSS, JavaScript, manifest, icon, and data assets.

In the present implementation:

- no third-party script dependencies are loaded by the application shell
- no server-side executable component is used
- no binary installer is distributed
- no remote code-loading mechanism is included in the application shell
- offline behaviour is handled locally through a same-origin service worker

This description refers to the public source version and its corresponding static deployment.

## Project identity

**Name:** Operational Gap Companion

**Short name:** Δop

**Core idea:** a periodic-table-based diagnostic companion for operational-gap analysis in inorganic electronic-state assignment.

## Versioning recommendation

For citation, reproducibility, and manuscript use, released versions should be tagged explicitly in the repository so that a fixed public version can be identified and audited.

## Next development target

The next development step is the refinement of installability, icon identity, and released-version auditability for the static Progressive Web App deployment.
