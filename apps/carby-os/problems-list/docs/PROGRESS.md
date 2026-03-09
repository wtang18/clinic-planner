# Problems List Prototype — Progress

> **Last Updated:** 2026-03-09

## Status

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Foundation — App Scaffold + Design System + Shell | Not Started |
| 2 | Problems List — Data + Filter Bar + Sections | Not Started |
| 3 | Problems List — Interactive Actions | Not Started |
| 4 | Detail Drawer + Polish | Not Started |

## Current Focus

Phase 1 — setting up the Vite app and patient shell.

## Blockers

- Detail drawer Figma node needed for Phase 4 (user has it ready)
- All-states Figma node available for reference (user to share)

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-09 | Vite + React over Next.js | Client-side prototype, no SSR/backend needed |
| 2026-03-09 | Copy design system components (not extract) | Faster setup, can extract to shared package later |
| 2026-03-09 | apps/carby-os/ as shared app for all production EHR prototypes | Reusable patient shell across features |
| 2026-03-09 | All 4 record types in scope | Stakeholder review needs full picture |
| 2026-03-09 | Demo-ready interactions (not static mock) | Internal stakeholders need to feel the workflow |
